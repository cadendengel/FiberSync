from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection setup
client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['fibersync_db']

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
