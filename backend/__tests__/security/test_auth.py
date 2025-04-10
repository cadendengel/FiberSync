import os
import sys
# Add the project root directory to Python's module path so imports like `from backend.src...` had to add this
# to get the tests to actually run..
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from dotenv import load_dotenv

# Manually load .env from the Fibersync root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(env_path)

from backend.src.app import app # imports Flask App instance
import unittest
import json

class TestAuthSecurity(unittest.TestCase):
    def setUp(self):
        # Use Flask's built-in test client to simulate HTTP requests
        self.client = app.test_client()

        # Extra Cleanup, this will ensure securetester doesn't already exist
        from backend.src.UserDB import userDB
        if userDB.get_user_by_username("securetester"):
            userDB.delete_user("securetester")

    def test_login_missing_fields(self):
        """
        Test sends an empty JSON object to the login endpoint.
        Expect a 404 response with an error message due to missing fields.
        """
        response = self.client.post('/api/users/login', json={})
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn("error", data)

    def test_login_invalid_user(self):
        """
        Test will attempt to log in with a non-existent user.
        Expect a 404 response indicating user not found.
        """
        response = self.client.post('/api/users/login', json={
            "username": "nonexistent",
            "password": "fakepassword"
        })
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.get_json())

    def test_login_wrong_password(self):
        """
        Test will first create a valid user, then attempt login with the wrong password.
        Expect a 401 response indicating invalid credentials.
        """
        self.client.post('/api/users/create', json={
            "username": "securetester",
            "password": "correctpass"
        })

        response = self.client.post('/api/users/login', json={
            "username": "securetester",
            "password": "wrongpass"
        })

        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.get_json())

    @classmethod
    def tearDownClass(cls):
        from src.UserDB import userDB
        userDB.delete_user("securetester")

if __name__ == '__main__':
    unittest.main()
