print("Starting Flask App...") # This is debug text. We can remove it if anyone wants.

import eventlet
import eventlet.wsgi
eventlet.monkey_patch()  # Enable async support

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime, timezone
from src.UserDB import userDB
from src.MessageDB import msgDB
from flask_socketio import SocketIO, emit, join_room, leave_room

# ===== Initialize Flask App ===== #
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")


# ===== Root Route to Verify Backend Status ===== #
# Changes: No longer serves React App to Browser
@app.route('/')
def home():
    return "FiberSync Backend is Running!"


# ===== Database Connection Test ===== #
@app.route('/api/test-mongo', methods=['GET'])
def test_mongo():
    from pymongo import MongoClient

    try:
        mongo_uri = os.getenv('MONGODB_LOGIN')
        if "?" in mongo_uri:
            mongo_uri += "&directConnection=true"
        else:
            mongo_uri += "?directConnection=true"

        client = MongoClient(mongo_uri)
        db_names = client.list_database_names()  # Fetch all database names
        return jsonify({"databases": db_names}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ======================================= #
#             User Management             # 
# ======================================= #
# This section is responsible for username storage. Later, it will be extended to include password authentication.
# For now, it only stores a username when a user enters the app.

# Get all users (for debugging or potential user list feature)
@app.route('/api/users', methods=['GET'])
def get_all_users():
    users = userDB.get_all_users()
    user_data = []
    for user in users:
        user_data.append(user['username'])
    return jsonify(user_data), 200


# Get user count
@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    count = userDB.get_user_count()
    return jsonify({"count": count}), 200


# Delete all users
@app.route('/api/users', methods=['DELETE'])
def delete_all_users():
    userDB.delete_all_users()
    return jsonify({"message": "All users deleted"}), 200


# Login OR Register user
# Will be adding a Login/Register feature in SCRUM-69
@app.route('/api/users/login', methods=['POST'])
def user_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Prevent empty fields (for debugging)
    if not data or not username or not password:
        return jsonify({"error": "Missing data"}), 404
    
    # Check if user is in the database
    if userDB.get_user_by_username(username):
        if userDB.is_user_authenticated(username, password):
            return jsonify({"message": "User logged in successfully"}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    else:
        return jsonify({"error": "User not found"}), 404


# Create a new user
@app.route('/api/users/create', methods=['POST'])
def user_create():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Prevent empty fields (for debugging)
    if not data or not username or not password:
        return jsonify({"error": "Missing data"}), 404
    
    # Check if user is in the database
    if userDB.get_user_by_username(username):     
        return jsonify({"error": "User already exists"}), 409
    else:
        userDB.add_user(username, password, [])
        return jsonify({"message": "User created successfully"}), 200
    

# ROUTE LIKELY NOT NEEDED
# Verify user credentials (username and password)
@app.route('/api/users/authentication/credentials', methods=['POST'])
def is_user_authenticated():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if userDB.is_user_authenticated(username, password):
        return jsonify({"authenticated": True}), 200
    return jsonify({"authenticated": False}), 401


# Verify user credentials (cookies)
@app.route('/api/users/authentication/cookies', methods=['POST'])
def is_cookie_authenticated():
    data = request.json
    cookies = data.get('cookies')

    if userDB.is_cookie_authenticated(cookies):
        return jsonify({"authenticated": True}), 200
    return jsonify({"authenticated": False}), 401



# ======================================= #
#      Real-Time Chat Functionality       # 
# ======================================= #
# WebSocket Event: Handling messages in real-time
#    - Listens for "send_message" events from clients
#    - Saves the message in the database
#    - Broadcasts it to all connected clients instantly

# Ensure Home Channel (atleast one) exists
if msgDB.get_channels() == []:  # If there are no channels in the database
    print("No channels found. Creating 'Home' channel...")
    msgDB.add_channel("Home")
else:
    print("Channels already exist, skipping default creation.")

# WebSocket Event: Handles users joining channels
@socketio.on("join_channel")
def join_channel(data):
    channel = data.get("channel")
    if not channel:
        return

    sid = request.sid  # Get socket session ID
    print(f"User {sid} attempting to join channel: {channel}")

    # Leave any existing rooms
    leave_room(channel)
    
    # Join the new channel
    join_room(channel)
    print(f"User {sid} joined channel: {channel}")


# WebSocket Event: Handles real-time message sending 
@socketio.on("send_message")
def handle_message(data):
    print(f"Received message: {data}")

    if "user" not in data or "text" not in data or "channel" not in data:
        return

    # Generate message ID and timestamp
    from datetime import datetime
    from bson.objectid import ObjectId

    message_id = str(ObjectId())  # Generate a unique message ID
    timestamp = datetime.utcnow().isoformat()  # Get UTC timestamp

    # Save message to the database
    msgDB.add_message(message_id, timestamp, data["user"], data["text"], data["channel"])

    print(f"Broadcasting message to channel: {data['channel']}")

    # Broadcast the message to all connected clients
    emit("receive_message", {
        "messageid": message_id,
        "timestamp": timestamp,
        "user": data["user"],
        "text": data["text"],
        "channel": data["channel"]
    }, room=data["channel"])


# ======================================= #
#           Channel Management            # 
# ======================================= #
# Create a new Channel
@app.route('/api/channels/create', methods=['POST'])
def create_channel():
    data = request.json
    channel_name = data.get("name")

    if not channel_name:
        return jsonify({"error": "Channel name required"}), 400

    if msgDB.add_channel(channel_name):
        return jsonify({"name": channel_name}), 201
    else:
        return jsonify({"error": "Channel limit reached (5 max)"}), 400


# Fetches all available channels
@app.route('/api/channels', methods=['GET'])
def get_channels():
    channels = msgDB.get_channels()
    return jsonify(channels), 200


# Delete a Channel
@app.route('/api/channels/delete', methods=['DELETE'])
def delete_channel():
    data = request.json
    channel_name = data.get("name")

    if not channel_name:
        return jsonify({"error": "Missing channel name"}), 400

    msgDB.delete_channel(channel_name)
    return jsonify({"message": f"Channel '{channel_name}' and its messages deleted"}), 200


# ======================================= #
#            Message Handling             # 
# ======================================= #
# Post message to database
@app.route('/api/messages/create', methods=['POST'])
def send_message():
    data = request.json

    if not data or "user" not in data or "text" not in data:
        return jsonify({"error": "Missing username or message text"}), 400  
    
    # Message ID and timestamp generation happen during object creation
    chat_event = { 
        "id": data["messageid"],
        "timestamp": data["timestamp"],
        "user": data["user"],
        "text": data["text"]
    }

    # Store the message in the database
    msgDB.add_message(data["messageid"], data["timestamp"], data["user"], data["text"])

    return jsonify(chat_event), 201

# Get all messages (Later, change to get all in channel only)
"""@app.route('/api/messages/all', methods=['GET'])
def get_messages():
    messages = msgDB.get_all_messages()
    result = []
    # Convert ObjectId to string for JSON serialization
    for document in messages:
        document["_id"] = str(document["_id"])
        result.append(document)

    # Sort messages by timestamp
    result.sort(key=lambda x: x["timestamp"])

    if not result:
        return jsonify({"error": "No messages found"}), 404
    
    return result, 200"""

@app.route('/api/messages/<channel>', methods=['GET'])
def get_messages(channel):
    messages = msgDB.get_messages_by_channel(channel)
    
    if not messages:
        return jsonify({"error": "No messages found"}), 404

    return jsonify(messages), 200


# Get message by ID
@app.route('/api/messages/id', methods=['GET'])
def get_message_by_id():
    data = request.json
    message_id = data["messageid"]

    if not message_id:
        return jsonify({"error": "Missing message ID"}), 400

    message = msgDB.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Message with that ID not found"}), 404

    return jsonify(message), 200

# Get messages by username
@app.route('/api/messages/username', methods=['GET'])
def get_messages_by_username():
    data = request.json
    username = data["username"]

    if not username:
        return jsonify({"error": "Missing username"}), 400

    messages = msgDB.get_messages_by_username(username)
    if not messages:
        return jsonify({"error": "No messages found for this user"}), 404

    return jsonify(messages), 200

# Delete all messages
@app.route('/api/messages/all', methods=['DELETE'])
def delete_all_messages():
    result = msgDB.delete_all_messages()
    if result.deleted_count == 0:
        return jsonify({"error": "No messages found"}), 404
    return jsonify({"message": "All messages deleted successfully"}), 200

# Delete message by ID
@app.route('/api/messages/id', methods=['DELETE'])
def delete_message():
    data = request.json
    message_id = data["messageid"]
    if not message_id:
        return jsonify({"error": "Missing message ID"}), 400
    result = msgDB.delete_message(message_id)
    if result.deleted_count == 0:
        return jsonify({"error": "Message with that ID not found"}), 404
    return jsonify({"message":"Message deleted successfully", id: data["messageid"]}), 200

# ======================================= #
#               User Status               # 
# ======================================= #
# This section will track when a user is connected or not.

# User Connection Tracking:
#    - Logs when a user connects/disconnects on the backend
#    - Can be expanded to update online status in the database, didn't want to mess with this too much and step into
#            your user status tracking Ricky

@socketio.on("connect")
def handle_connect():
    print(f"+ Client connected: {request.sid}")

@socketio.on("disconnect")
def handle_disconnect():
    print(f"- Client disconnected: {request.sid}")

# Update user status (Mark online/offline)
@app.route('/api/user-status', methods=['POST'])
def update_user_status():
    data = request.json
    username = data.get('username')  # The user whose status is updating
    status = data.get('status')  # Expected values: "online" or "offline"

    if not username or status not in ["online", "offline"]:
        return jsonify({"error": "Invalid status update"}), 400  # Prevent bad data

    return jsonify({"message": f"{username} is now {status}"}), 200  # Confirmation response



# ================================================== #
#            STARTING FLASK SERVER                   #
# ================================================== #
# Running Flask + WebSocket Server:
#    - Uses socketio.run() instead of app.run() to support WebSockets
#    - log_output=True ensures we can debug connection problems
if __name__ == "__main__":
    print("Running Flask App...")          # Debug Statement to confirm everything started, can remove if anyone else wants
    print("Flask App is running in the background at 127.0.0.1:5000")   # Kind of a reminder for local development
    socketio.run(app, host="0.0.0.0", port=5000, debug=False, log_output=True)