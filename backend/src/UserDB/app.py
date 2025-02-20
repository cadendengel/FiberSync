# This was previously server.py, it's now correctly located here.
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime, timezone
import database

# Initialize Flask app
app = Flask(__name__, static_folder="../../../frontend/build", static_url_path="")  
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
    users = database.get_all_users()
    return jsonify(users)

# Get user count
@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    return database.get_user_count()

# Create a new user entry
@app.route('/api/users/create', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')  # Currently stored as plain text (to be updated)
    cookies = data.get('cookies')    # Not implemented yet

    # Prevent empty fields
    if not data or not username or not password:
        return jsonify({"error": "Missing data"}), 400
    
    # Check if username already exists in the database
    if database.get_user_by_username(username):  
        return jsonify({"error": "Username already exists"}), 409 

    # handle no cookies
    if cookies is None:
        cookies = []

    # Store the new user
    database.add_user(username, password, cookies)

    # CADEN: NOT SURE IF THESE BELOW LINES ARE NECESSARY
    print(f"Simulated: Added user {username}")  # Debugging log
    return jsonify({"message": "User created successfully"}), 201

# Verify user credentials (username and password)
@app.route('/api/users/authentication/credentials', methods=['POST'])
def is_user_authenticated():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if database.is_user_authenticated(username, password):
        return jsonify({"authenticated": True})
    return jsonify({"authenticated": False})

# Verify user credentials (cookies)
@app.route('/api/users/authentication/cookies', methods=['POST'])
def is_cookie_authenticated():
    data = request.json
    cookies = data.get('cookies')

    if database.is_cookie_authenticated(cookies):
        return jsonify({"authenticated": True})
    return jsonify({"authenticated": False})



####################################
# ===== Chat Message Handling =====# (Chris)
####################################
# This section allows users to send chat messages. Currently, messages are not stored persistently.
# Chris can modify this to store and retrieve messages from the database.

# Send a chat message (Currently, only returns message object)
@app.route('/api/messages', methods=['POST'])
def send_message():
    data = request.json

    if not data or "user" not in data or "text" not in data:
        return jsonify({"error": "Missing username or message text"}), 400  

    # Use timezone-aware datetime to fix deprecation warning
    timestamp = data.get("timestamp", datetime.now(timezone.utc).isoformat())

    chat_event = {
        "type": "message",
        "user": data["user"],
        "text": data["text"],
        "timestamp": timestamp
    }

    return jsonify(chat_event), 201


# Get Messages, ensures this is working
@app.route('/api/messages', methods=['GET'])
def get_messages():
    # Dummy messages for testing we can replace with DB retrieval later
    messages = [
        {"user": "Chris", "text": "Hello, world!", "timestamp": "2025-02-18T12:30:00Z"},
        {"user": "Alice", "text": "Welcome to FiberSync!", "timestamp": "2025-02-18T12:31:00Z"}
    ]
    return jsonify(messages), 200



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
