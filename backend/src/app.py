# This was previously server.py, it's now correctly located here.
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime, timezone
from UserDB import userDB
from MessageDB import msgDB

# Initialize Flask apps
app = Flask(__name__, static_folder="../../frontend/build", static_url_path="")  
CORS(app)  # Enable CORS to allow frontend to communicate with backend

# Serve React App (Production)
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')



##############################
# ===== User Management =====# (Caden)
##############################
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

# Create a new user entry
@app.route('/api/users/create', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')

    # Prevent empty fields
    if not data or not username:
        return jsonify({"error": "Missing data"}), 404

    # Store the new user
    userDB.add_user(username, "password", [])

    # The below line might be a bug?
    return jsonify({"message": "User created successfully"}), 200

# Get username
@app.route('/api/users/username', methods=['GET'])
def get_username():
    username = userDB.temp_get_random_user()
    return jsonify({"username": username}), 200


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



####################################
# ===== Chat Message Handling =====# (Chris)
####################################

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
@app.route('/api/messages/all', methods=['GET'])
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
    
    return result, 200

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

#########################################
# ===== User Online/Offline Status =====# (Ricky)
#########################################
# This section will track when a user is connected or not. Ricky can implement logic to update user status in the database.

# Update user status (Mark online/offline)
@app.route('/api/user-status', methods=['POST'])
def update_user_status():
    data = request.json
    username = data.get('username')  # The user whose status is updating
    status = data.get('status')  # Expected values: "online" or "offline"

    if not username or status not in ["online", "offline"]:
        return jsonify({"error": "Invalid status update"}), 400  # Prevent bad data

    return jsonify({"message": f"{username} is now {status}"}), 200  # Confirmation response




# ===== Run Flask Server ===== (For Development)
# This starts the Flask server.
if __name__ == "__main__":
    app.run(debug=True)