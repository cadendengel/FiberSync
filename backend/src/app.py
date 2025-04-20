import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# print("Starting Flask App...") # This is debug text. We can remove it if anyone wants. Commenting out for tests

import eventlet
import eventlet.wsgi
eventlet.monkey_patch()  # Enable async support

from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from datetime import datetime, timezone
from backend.src.UserDB import userDB
from backend.src.MessageDB import msgDB
from flask_socketio import SocketIO, emit, join_room, leave_room

# DevConsole imports
import io
import contextlib

# ===== Initialize Flask App ===== #
app = Flask(__name__)
CORS(app)

# Added for security tests, but provides security off of every request
@app.after_request
def apply_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'              # Prevent browser from guessing content type
    response.headers['X-Frame-Options'] = 'DENY'                        # Prevent site being loaded in an iFrame
    response.headers['Content-Security-Policy'] = "default-src 'self'"  # Limit content sources
    return response

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet", ping_interval=5, ping_timeout=10)

# Track which socket ID is tied to which username
sid_to_username = {}

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
# This section is responsible for user database functions.

@app.route('/api/users/<username>', methods=['DELETE'])
def delete_user_by_name_route(username):
    try:
        userDB.delete_user(username)
        return {"message": f"{username} deleted successfully"}, 200
    except Exception as e:
        return {"error": str(e)}, 500

# Get all users (for debugging or potential user list feature)
@app.route('/api/users', methods=['GET'])
def get_all_users():
    users = userDB.get_all_users()
    user_data = []
    for user in users:
        user_data.append(user['username'])
        user_data.append(userDB.get_user_status(user['username']))
    return jsonify(user_data), 200


# Get user count
@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    count = userDB.get_user_count()
    return jsonify({"count": count}), 200


# Get user timestamp
@app.route('/api/users/timestamp', methods=['POST'])
def get_user_timestamp():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({"error": "Missing username"}), 400
    
    timestamp = userDB.get_timestamp_by_username(username)
    if not timestamp:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"timestamp": timestamp}), 200


# Get user description
@app.route('/api/users/description', methods=['POST'])
def get_user_description():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({"error": "Missing username"}), 404
    
    description = userDB.get_description_by_username(username)
    if not description:
        return jsonify({"error": "Description not found"}), 204

    return jsonify({"description": description}), 200


# Update user description
@app.route('/api/users/description', methods=['PUT'])
def update_user_description():
    data = request.json
    username = data.get('username')
    description = data.get('description')

    if not username:
        return jsonify({"error": "Missing username"}), 400
    if not description:
        return jsonify({"error": "Missing description"}), 400
    
    if userDB.get_user_by_username(username):
        userDB.update_description(username, description)
        return jsonify({"message": "User description updated successfully"}), 200
    else:
        return jsonify({"error": "User not found"}), 404


# Delete all users
@app.route('/api/users', methods=['DELETE'])
def delete_all_users():
    userDB.delete_all_users()
    return jsonify({"message": "All users deleted"}), 200


# Login user
@app.route('/api/users/login', methods=['POST'])
def user_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    cookie = data.get('cookie')

    # Prevent empty fields (for debugging)
    if not data or not username or not password:
        return jsonify({"error": "Missing data"}), 404
    
    # Check if user is in the database
    if userDB.get_user_by_username(username):
        if userDB.is_user_authenticated(username, password):
            if cookie:
                userDB.update_user_cookies(username, cookie)
            return jsonify({"message": "User logged in successfully via username and password"}), 200
        else:
            return jsonify({"error": "Invalid password"}), 401
    else:
        return jsonify({"error": "User not found"}), 404
    
# Create user
@app.route('/api/users/create', methods=['POST'])
def user_create():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    cookie = data.get('cookie')

    # Prevent empty fields (for debugging)
    if not data or not username or not password:
        return jsonify({"error": "Missing data"}), 404
    
    # Check if user is in the database
    if userDB.get_user_by_username(username):   
        return jsonify({"error": "User already exists"}), 409
    else:
        if cookie: userDB.add_user(username, password, cookie)
        else: userDB.add_user(username, password, [])
        return jsonify({"message": "User created successfully"}), 200
    

# ROUTE MAYBE NOT NEEDED
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
    cookie = data.get('cookie')

    if userDB.is_cookie_authenticated(cookie):
        return jsonify({"authenticated": True, "username": userDB.get_user_by_cookies(cookie)}), 200
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
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Get UTC timestamp

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
        # Broadcast the new channel to all connected clients
        socketio.emit("update_channels", {}, to=None)
        
        return jsonify({"name": channel_name}), 201
    else:
        return jsonify({"error": "Channel limit reached (5 max)"}), 400


# Fetches all available channels
@app.route('/api/channels', methods=['GET'])
def get_channels():
    channels = msgDB.get_channels()
    return jsonify(channels), 200

# Clear a channel
@app.route('/api/channels/clear', methods=['DELETE'])
def clear_channel():
    channel = request.json.get("channel")
    
    if not channel:
        return jsonify({"error": "Channel name required"}), 400
    
    if (channel == "all"):
        msgDB.clear_all_channels()
        return jsonify({"message": "All channels cleared"}), 200
    else:
        msgDB.clear_channel(channel)
        return jsonify({"message": f"Channel '{channel}' cleared"}), 200


# Delete a Channel
@app.route('/api/channels/delete', methods=['DELETE'])
def delete_channel():
    data = request.json
    channel_name = data.get("name")

    if not channel_name:
        return jsonify({"error": "Missing channel name"}), 400

    msgDB.delete_channel(channel_name)
    
    # Broadcast the deleted channel to all connected clients
    socketio.emit("update_channels", {}, to=None)
    
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
        return jsonify([]), 200
    
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

# Edit message by ID (Button NYI)
@app.route('/api/messages/edit', methods=['POST'])
def edit_message():
    data = request.json
    message_id = data["message_id"]
    new_text = data["text"]

    if not message_id:
        return jsonify({"error": "Missing message ID"}), 400
    
    if not new_text:
        msgDB.edit_message(message_id, "This message is blank.")
    else: 
        msgDB.edit_message(message_id, new_text)
    
    return jsonify({"message": "Message edited successfully"}), 200

# Delete all messages
@app.route('/api/messages/all', methods=['DELETE'])
def delete_all_messages():
    msgDB.delete_all_messages()

    if msgDB.get_all_messages() == 0:
        return jsonify({"error": "No messages found"}), 404
    
    return jsonify({"message": "All messages deleted successfully"}), 200

# Delete message by ID
@app.route('/api/messages/id', methods=['DELETE'])
def delete_message():
    data = request.json
    message_id = data["messageid"]

    if not message_id:
        return jsonify({"error": "Missing message ID"}), 400
    
    msgDB.delete_message(message_id)
    if not msgDB.get_message_by_id(message_id):
        return jsonify({"message":"Message deleted successfully", "id": data["messageid"]}), 200
    else:
        return jsonify({"error": "Message_id still in database"}), 404

# ======================================= #
#            Direct Messaging             # 
# ======================================= #
# This section does not post to the Database and serves to host the WebSocket rooms for Direct Messaging
# WebSocket Event: Handles DM Invite
@socketio.on("dm_invite")
def handle_dm_invite(data):
    from_user = data.get("from")
    to_user = data.get("to")
    print(f"DM invite from {from_user} to {to_user}")

    for sid, user in sid_to_username.items():
        if user == to_user:
            emit("dm_invite", {"from": from_user}, room=sid)
            break

# WebSocket Event: Handles DM Acceptance and Room Setup
@socketio.on("dm_accept")
def handle_dm_accept(data):
    from_user = data.get("from")  # The user who accepted the invite
    to_user = data.get("to")      # The original inviter

    room_id = "_".join(sorted([from_user, to_user]))
    print(f"DM session established between {from_user} and {to_user}, room: {room_id}")

    for sid, user in sid_to_username.items():
        if user == from_user:
            join_room(room_id, sid=sid)
            emit("dm_session_started", {
                "room": room_id,
                "withUser": to_user  # this user is DMing to_user
            }, room=sid)
        elif user == to_user:
            join_room(room_id, sid=sid)
            emit("dm_session_started", {
                "room": room_id,
                "withUser": from_user  # this user is DMing from_user
            }, room=sid)



@socketio.on("dm_message")
def handle_dm_message(data):
    room = data["room"]
    from_user = data["from"]
    message = data["message"]
    
    print(f"[DM] {from_user} to room {room}: {message}")
    emit("receive_dm", {"from": from_user, "message": message}, room=room)


@socketio.on("leave_dm")
def handle_leave_dm(data):
    room = data.get("room")
    if room:
        leave_room(room)
        print(f"User left DM room {room}")


# ======================================= #
#               User Status               # 
# ======================================= #
# This section will track when a user is connected or not.

# User Connection Tracking:
#    - Logs when a user connects/disconnects on the backend
#    - Can be expanded to update online status in the database, didn't want to mess with this too much and step into
#            your user status tracking Ricky


# WebSocket Event: Handles user connection
#   - Updates user status in the database (deployment, not development only, I think)
#   - Tracks WebSocket SID -> username mappings for disconnection cleanup
#   - On "offline", disconnect below: updates DB + emits + removes/pops from sid map

'''You were using `request.args.get("username")` to extract the username
   from that WebSocket handshake business deal query string thing which works on login but it was stale or no longer dynamic
   but it looked like Websocket can use `data.get("username")` from client side emit calls 
   as long as we pass data into the function on this end. 
   (https://forum.chirpstack.io/t/how-to-get-data-from-websocket-using-python/16892)
   This is from client-side `socket.emit()` events... `data` from `socket.emit()` gives us access to real-time, 
   event-based ~payloads~ is what the tech gurus seem to be calling it. '''
@socketio.on("user_status")
def handle_user_status(data):
    username = data.get("username")
    status = data.get("status")
    sid = request.sid
    print("Username:", username)

    if username:
        sid_to_username[sid] = username  # Track SID → username

        if status == "online":
            userDB.update_status(username, "online")
            print(f"{username} connected with SID {sid}")
            emit("user_status", {"username": username, "status": "online"}, broadcast=True)

        elif status == "offline":
            userDB.update_status(username, "offline")
            print(f"{username} disconnected with SID {sid}")
            emit("user_status", {"username": username, "status": "offline"}, broadcast=True)

        else:
            print(f"Invalid status: {status}")
    else:
        print(f"No username provided for SID {sid}")

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    username = sid_to_username.pop(sid, None)

    if username:
        print(f"{username} disconnected (SID {sid})")
        userDB.update_status(username, "offline")
        emit("user_status", {"username": username, "status": "offline"}, broadcast=True)
    else:
        print(f"Disconnected SID {sid} with no associated username")

# Update user status (Mark online/offline)
@app.route('/api/user-status', methods=['POST'])
def update_user_status():
    data = request.json
    username = data.get('username')  # The user whose status is updating
    status = data.get('status')  # Expected values: "online" or "offline"

    if not username or status not in ["online", "offline"]:
        return jsonify({"error": "Invalid status update"}), 400  # Prevent bad data

    userDB.update_status(username, status)  # Update user status in the database
    return jsonify({"message": f"{username} is now {status}"}), 200  # Confirmation response

# Caden: I needed to add this
@app.route('/api/user-status', methods=['GET'])
def get_user_status():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({"error": "Missing username"}), 400
    
    user = userDB.get_user_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"status": user["status"]}), 200


#########################################
# ===== User reactions =====# (Ricky)
#########################################
@app.route('/api/messages/reactions', methods=['POST'])
def update_reaction():
    data = request.json
    message_id = data.get('message_id')
    emoji = data.get('emoji')
    mode = data.get('mode')


    if not message_id or not emoji or not mode:
        return jsonify({"error": "missing data"}), 400

    message = msgDB.get_message_by_id(message_id)
    if not message:
        return jsonify({"error": "Message not found"}), 404
   
    if mode == "inc":
        msgDB.add_emoji_to_message(message_id, emoji)

    elif mode == "dec":
        emoji_count = msgDB.get_emoji_count_by_messageid(message_id, emoji)
        if emoji_count < 0:
            msgDB.remove_emoji_from_message(message_id, emoji)
            return jsonify({"error": "Database error, emoji count < 0, emoji removed from reaction{}"}), 400
        elif emoji_count == 0:
            return jsonify({"error": "Emoji count is already 0, cannot decrement"}), 400
        elif emoji_count == 1:
            msgDB.remove_emoji_from_reactions(message_id, emoji)
        else:
            msgDB.remove_emoji_from_message(message_id, emoji)    
    else:
        return jsonify({"error": "bad mode data"}), 400

    return jsonify({"message": "reaction/s successfully added to message"}), 200


##################
# Developer Mode #
##################
@app.route('/api/devconsole', methods=['POST'])
def dev_console_command():
    data = request.json
    command = data.get('command')

    if not command:
        return jsonify({"error": "Missing command"}), 400

    # Restrict the execution environment
    allowed_globals = {
        "get_user_count": userDB.get_user_count,
        # "get_all_users": userDB.get_all_users, # Uncomment if needed, returns a cursor object, so it might not work as expected
        "get_user_by_username": userDB.get_user_by_username,
        "print": print,  # Allow print for debugging
    }

    # Capture the output of the command
    output = io.StringIO()
    try:
        with contextlib.redirect_stdout(output):
            # Use eval for expressions and exec for statements
            if "=" in command or " " in command.split("(")[0]:  # Likely a statement
                exec(command, {"__builtins__": None}, allowed_globals)
            else:  # Likely an expression
                result = eval(command, {"__builtins__": None}, allowed_globals)
                print(result)  # Print the result to capture it in the output

        return jsonify({"message": "Command executed successfully", "output": output.getvalue()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================================================== #
#            STARTING FLASK SERVER                   #
# ================================================== #
# Running Flask + WebSocket Server:
#    - Uses socketio.run() instead of app.run() to support WebSockets
#    - log_output=True ensures we can debug connection problems
if __name__ == "__main__":
    print("Running Flask App...")          # Debug Statement to confirm everything started, can remove if anyone else wants
    print("Flask App is running in the background at 127.0.0.1:5000")   # Kind of a reminder for local development
    # os.environ['ENV'] = 'development'  # Set the environment to development (for printing from app.py)
    socketio.run(app, host="0.0.0.0", port=5000, debug=False, log_output=True)