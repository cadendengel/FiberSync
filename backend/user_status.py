from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

# MongoDB connection setup
client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['fibersync_db']

######################
# Database Functions #
######################

# Get user status by username (returns 'online' or 'offline')
def get_user_status_by_username(username):
    """
    Fetch the user's status based on their username.
    Returns 'online', 'offline', or None if user doesn't exist.
    """
    user = db.users.find_one({"username": username})
    if user:
        return user.get('status', 'offline')  # Default to 'offline' if no status is set
    return None

# Update user's status (e.g., 'online' or 'offline')
def update_user_status(username, status):
    """
    Update the status of a user (can be 'online' or 'offline').
    """
    if status not in ['online', 'offline']:
        raise ValueError("Invalid status. Must be 'online' or 'offline'.")
    
    user = db.users.find_one({"username": username})
    if not user:
        raise ValueError("User not found.")  # If the user doesn't exist, raise an error
    
    db.users.update_one(
        {"username": username},
        {"$set": {
            "status": status,
            "last_status_change": datetime.utcnow()  # Update the timestamp for status change
        }}
    )
