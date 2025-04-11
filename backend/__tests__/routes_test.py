import os
from dotenv import load_dotenv

# Run all tests:
# python -m unittest discover -s ./backend/__tests__ -p *_test.py

# Run this test:
# python -m unittest discover -s ./backend/__tests__ -p routes_test.py


# Manually load .env from the Fibersync root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(env_path)

# Import app.py
from backend.src import app

import unittest
import json


class TestRoutes(unittest.TestCase):
    def setUp(self):
        self.app = app.app  # Reference the Flask app instance
        self.app.testing = True
        self.client = self.app.test_client()  # Initialize the test client
        
        # Initialize the test databases
        app.userDB.init_db_for_testing()
        app.msgDB.init_db_for_testing()
        
        # Ensure the databases are empty
        app.userDB.delete_all_users()
        app.msgDB.delete_all_messages()
    
    @classmethod
    def tearDownClass(cls):
        # Clean up the database after all tests
        app.userDB.delete_all_users()
        app.msgDB.delete_all_messages()
        app.userDB.client.close()
        app.msgDB.client.close()
        
    ################
    # UserDB Tests #
    ################
    def test_get_all_users(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser1", "password": "password1", "cookie": ["cookie1"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get all users
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 200, "Failed to fetch users")
        
        # Parse the JSON response
        users = response.get_json()
        
        # Validate the user data
        self.assertEqual(users[0], "testuser1", "Username does not match")
        
    def test_get_user_count(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser1", "password": "password1", "cookie": ["cookie1"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get user count
        response = self.client.get('/api/users/count')
        self.assertEqual(response.status_code, 200, "Failed to fetch user count")
        
        # Parse the JSON response
        user_count = response.get_json()
        
        # Validate the user count
        self.assertEqual(user_count["count"], 1, "User count does not match")
        
        # Create another user
        response = self.client.post('/api/users/create', json={"username": "testuser2", "password": "password2", "cookie": ["cookie2"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get user count again
        response = self.client.get('/api/users/count')
        self.assertEqual(response.status_code, 200, "Failed to fetch user count")
        
        # Parse the JSON response
        user_count = response.get_json()
        
        # Validate the user count
        self.assertEqual(user_count["count"], 2, "User count does not match")
        
    def test_delete_all_users(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser1", "password": "password1", "cookie": ["cookie1"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Create another user
        response = self.client.post('/api/users/create', json={"username": "testuser2", "password": "password2", "cookie": ["cookie2"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get user count
        response = self.client.get('/api/users/count')
        self.assertEqual(response.status_code, 200, "Failed to fetch user count")
        
        # Parse the JSON response
        user_count = response.get_json()
        
        # Validate the user count
        self.assertEqual(user_count["count"], 2, "User count does not match")
        
        # Delete all users
        response = self.client.delete('/api/users')
        self.assertEqual(response.status_code, 200, "Failed to delete users")
        
        # Get user count
        response = self.client.get('/api/users/count')
        self.assertEqual(response.status_code, 200, "Failed to fetch user count")
        
        # Parse the JSON response
        user_count = response.get_json()
        
        # Validate the user count
        self.assertEqual(user_count["count"], 0, "User count does not match")
    
    
    
    
    #################
    # Channel Tests #
    #################
    
    
    
    
    
    
    
    
    
    #####################
    # User Status Tests #
    #####################








