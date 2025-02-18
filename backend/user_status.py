from datetime import datetime, timedelta  # Import modules for handling timestamps
from pymongo import MongoClient  # Import MongoDB client for database operations
from dotenv import load_dotenv  # Import dotenv to load environment variables
import os  # Import os to access environment variables

# Load environment variables from a .env file
load_dotenv()

class UserStatusManager:
    def __init__(self, db_uri=os.getenv('MONGODB_LOGIN'), db_name="fibersync"):
        """
        Initialize the UserStatusManager with a MongoDB connection.
        
        :param db_uri: MongoDB connection string (loaded from environment variables)
        :param db_name: Name of the database (default is "fibersync")
        """
        self.client = MongoClient(db_uri)  # Connect to MongoDB
        self.db = self.client[db_name]  # Select the specified database
        self.user_status = self.db.user_status  # Select or create the 'user_status' collection
        self._ensure_indexes()  # Ensure indexes are created for efficient querying

    def _ensure_indexes(self):
        """Ensure indexes for efficient querying and automatic data cleanup."""
        self.user_status.create_index("user_id", unique=True)  # Ensure unique user_id to prevent duplicates
        self.user_status.create_index("status")  # Index status field to optimize status-based queries
        self.user_status.create_index("last_active", expireAfterSeconds=2592000)  # Auto-remove inactive records after 30 days

    def update_status(self, user_id, status, device=None, custom_status=None):
        """
        Update the user's status in the database.

        :param user_id: Unique identifier for the user
        :param status: Current status of the user (e.g., "online", "offline")
        :param device: Optional list of devices the user is active on
        :param custom_status: Optional custom status message
        """
        query = {"user_id": user_id}  # Define search query to find the user
        update = {
            "$set": {
                "status": status,  # Update user's status
                "last_active": datetime.utcnow(),  # Update last active timestamp
                "updated_at": datetime.utcnow(),  # Update timestamp for last status change
            }
        }
        if device:
            update["$set"]["device"] = device  # Update device field if provided
        if custom_status:
            update["$set"]["custom_status"] = custom_status  # Update custom status if provided
        
        # Update the record, inserting it if it does not exist (upsert=True)
        self.user_status.update_one(query, update, upsert=True)

    def get_active_users(self):
        """
        Retrieve all users who are currently active (not offline).

        :return: List of active users with their IDs and statuses
        """
        return list(self.user_status.find(
            {"status": {"$ne": "offline"}},  # Find users whose status is NOT "offline"
            {"user_id": 1, "status": 1}  # Only return user_id and status fields
        ))

    def mark_inactive_users(self, timeout_minutes=10):
        """
        Mark users as offline if they have been inactive beyond the timeout.

        :param timeout_minutes: Number of minutes of inactivity before marking offline (default: 10 minutes)
        """
        inactive_threshold = datetime.utcnow() - timedelta(minutes=timeout_minutes)  # Calculate inactivity threshold
        self.user_status.update_many(
            {"last_active": {"$lt": inactive_threshold}},  # Find users who were last active before the threshold
            {"$set": {"status": "offline"}}  # Update their status to "offline"
        )

# Run the script when executed directly
if __name__ == "__main__":
    manager = UserStatusManager()  # Initialize the user status manager

    # Example: Update user status
    manager.update_status(user_id=1, status="online", device=["web"], custom_status="Coding")

    # Example: Retrieve and print active users
    print("Active users:", manager.get_active_users())

    # Example: Mark inactive users as offline
    manager.mark_inactive_users()
