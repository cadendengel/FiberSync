from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

# MongoDB connection setup
client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['fibersync_db']  # Use your database name here

######################
# Database Functions #
######################

# Initialize database (e.g., create collections if needed)
def init_db():
    """
    Initialize the database if necessary. For now, the database and collection are assumed to exist.
    Add logic here if you need to create collections or indexes in MongoDB.
    """
    # Example: Create index on username for faster lookups
    db.users.create_index("username", unique=True)

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
    Add other features like timestamp updates if necessary.
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

# Add a new user with initial status (default to 'offline')
def add_user(username, email, status="offline"):
    """
    Add a new user with initial status.
    """
    if status not in ['online', 'offline']:
        raise ValueError("Invalid status. Must be 'online' or 'offline'.")
    
    # Check if the user already exists
    if db.users.find_one({"username": username}):
        raise ValueError(f"User {username} already exists.")

    db.users.insert_one({
        "username": username,
        "email": email,
        "status": status,
        "last_seen": datetime.utcnow(),  # Add time of the user's last activity
        "status_message": "",  # Placeholder for future feature
        "last_status_change": datetime.utcnow(),
    })

# Fetch all user statuses (simple listing of usernames and their statuses)
def get_all_user_statuses():
    """
    Fetch a list of all users with their statuses (online/offline).
    """
    return list(db.users.find({}, {"username": 1, "status": 1, "_id": 0}))

# Delete all users (for testing or clearing data)
def delete_all_users():
    """
    Delete all users from the database.
    """
    db.users.delete_many({})

# Example function to get total count of users
def get_user_count():
    """
    Get the total number of users in the database.
    """
    return db.users.count_documents({})
