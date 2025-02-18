from datetime import datetime, timedelta
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()
class UserStatusManager:
    def __init__(self, db_uri=os.getenv('MONGODB_LOGIN'), db_name="fibersync"):
        self.client = MongoClient(db_uri)
        self.db = self.client[db_name]
        self.user_status = self.db.user_status
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Ensure indexes for efficient querying."""
        self.user_status.create_index("user_id", unique=True)
        self.user_status.create_index("status")
        self.user_status.create_index("last_active", expireAfterSeconds=2592000)  # Auto-remove after 30 days
    
    def update_status(self, user_id, status, device=None, custom_status=None):
        """Update the user's status."""
        query = {"user_id": user_id}
        update = {
            "$set": {
                "status": status,
                "last_active": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        }
        if device:
            update["$set"]["device"] = device
        if custom_status:
            update["$set"]["custom_status"] = custom_status
        
        self.user_status.update_one(query, update, upsert=True)
    
    def get_active_users(self):
        """Retrieve all users who are not offline."""
        return list(self.user_status.find({"status": {"$ne": "offline"}}, {"user_id": 1, "status": 1}))
    
    def mark_inactive_users(self, timeout_minutes=10):
        """Mark users as offline if they haven't been active recently."""
        inactive_threshold = datetime.utcnow() - timedelta(minutes=timeout_minutes)
        self.user_status.update_many(
            {"last_active": {"$lt": inactive_threshold}},
            {"$set": {"status": "offline"}}
        )
    
if __name__ == "__main__":
    manager = UserStatusManager()
    manager.update_status(user_id=1, status="online", device=["web"], custom_status="Coding")
    print("Active users:", manager.get_active_users())
    manager.mark_inactive_users()

