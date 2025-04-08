import unittest
import warnings
from datetime import datetime, timedelta
from backend.src.UserDB import user_status

# Run all tests:
# python -m unittest discover -s ./backend/__tests__ -p *_test.py

# Run this test:
# python -m unittest discover -s ./backend/__tests__ -p user_status_test.py

@unittest.skip("Skipping test: user_status.py is currently under refactor")
class TestUserStatusManager(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up a test database connection."""
        cls.manager = user_status.UserStatusManager(db_name="test_fibersync")  # Use a test database
        warnings.filterwarnings("ignore", category=DeprecationWarning)  # Suppress deprecation warnings
        warnings.filterwarnings("ignore", category=ResourceWarning)  # Suppress resource warnings

    def test_update_status(self):
        """Test updating user status."""
        print("Running test: test_update_status")
        self.manager.update_status(user_id="test_user", status="online", device=["web"], custom_status="Testing")
        user = self.manager.user_status.find_one({"user_id": "test_user"})
        self.assertIsNotNone(user)
        self.assertEqual(user["status"], "online")
        self.assertEqual(user["device"], ["web"])
        self.assertEqual(user["custom_status"], "Testing")
        print("Test for updating user status completed.")

    def test_get_active_users(self):
        """Test retrieving active users."""
        print("Running test: test_get_active_users")
        self.manager.update_status(user_id="active_user", status="online")
        active_users = self.manager.get_active_users()
        user_ids = [user["user_id"] for user in active_users]
        self.assertIn("active_user", user_ids)
        print("Test for retrieving active users completed.")

    def test_mark_inactive_users(self):
        """Test marking inactive users as offline."""
        print("Running test: test_mark_inactive_users")
        past_time = datetime.utcnow() - timedelta(minutes=11)  # Simulate inactivity
        self.manager.user_status.insert_one({"user_id": "inactive_user", "status": "online", "last_active": past_time})
        self.manager.mark_inactive_users(timeout_minutes=10)
        user = self.manager.user_status.find_one({"user_id": "inactive_user"})
        self.assertEqual(user["status"], "offline")
        print("Test for marking inactive users completed.")

    @classmethod
    def tearDownClass(cls):
        """Clean up test database."""
        cls.manager.db.drop_collection("user_status")
        cls.manager.client.close()

if __name__ == "__main__":
    unittest.main()
