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
    
    # ROUTES TESTED:
    # - create_user()
    # - get_all_users()
    def test_get_all_users(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser1", "password": "password1", "cookie": ["cookie1"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get all users
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 200, "Failed to fetch users")
        
        # Validate the user data
        self.assertEqual(response.get_json()[0], "testuser1", "Username does not match")
        
        
    # ROUTES TESTED:
    # - create_user()
    # - get_user_count()
    def test_get_user_count(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser1", "password": "password1", "cookie": ["cookie1"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get user count
        response = self.client.get('/api/users/count')
        self.assertEqual(response.status_code, 200, "Failed to fetch user count")
        
        # Validate the user count
        self.assertEqual(response.get_json()["count"], 1, "User count does not match")
        
        # Create another user
        response = self.client.post('/api/users/create', json={"username": "testuser2", "password": "password2", "cookie": ["cookie2"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Get user count again
        response = self.client.get('/api/users/count')
        self.assertEqual(response.status_code, 200, "Failed to fetch user count")
        
        # Validate the user count
        self.assertEqual(response.get_json()["count"], 2, "User count does not match")
        
        
    # ROUTES TESTED:
    # - create_user()
    # - get_user_count()
    # - delete_all_users()
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
        
        # Validate the user count
        self.assertEqual(response.get_json()["count"], 0, "User count does not match")
        
        
    # ROUTES TESTED:
    # - create_user()
    # - user_login()
    def test_user_login(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser", "password": "password", "cookie": ["cookie"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Login the user
        response = self.client.post('/api/users/login', json={"username": "testuser", "password": "password"})
        self.assertEqual(response.status_code, 200, "Failed to login user")
        self.assertEqual(response.get_json()["message"], "User logged in successfully via username and password", "User is not logged in")

        # Login the user with invalid credentials
        response = self.client.post('/api/users/login', json={"username": "testuser", "password": "wrong_password"})
        self.assertEqual(response.status_code, 401, "User should not be logged in with invalid credentials")
    
    
    # ROUTES TESTED:
    # - create_user()
    # - is_user_authenticated()
    def test_is_user_authenticated(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser", "password": "password", "cookie": ["cookie"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Check if the user is authenticated
        response = self.client.post('/api/users/authentication/credentials', json={"username": "testuser", "password": "password"})
        self.assertEqual(response.status_code, 200, "Failed to check if user is authenticated")
        
        # Check if the user is authenticated with invalid credentials
        response = self.client.post('/api/users/authentication/credentials', json={"username": "testuser", "password": "wrong_password"})
        self.assertEqual(response.status_code, 401, "User should not be authenticated with invalid credentials")
        
        
    # ROUTES TESTED:
    # - create_user()
    # - is_cookie_authenticated()
    def test_is_cookie_authenticated(self):
        # Create a user
        response = self.client.post('/api/users/create', json={"username": "testuser", "password": "password", "cookie": ["cookie"]})
        self.assertEqual(response.status_code, 200, "Failed to create user")
        
        # Check if the user is authenticated
        response = self.client.post('/api/users/authentication/cookies', json={"cookie": ["cookie"]})
        self.assertEqual(response.status_code, 200, "Failed to check if user is authenticated")
        
        # Check if the user is authenticated with an invalid cookie
        response = self.client.post('/api/users/authentication/cookies', json={"cookie": ["invalid_cookie"]})
        self.assertEqual(response.status_code, 401, "User should not be authenticated with invalid cookie")
        
    
    
    
    #################
    # Channel Tests #
    #################
    
    
    
    
    
    
    
    
    
    #####################
    # User Status Tests #
    #####################








