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
        # CADEN: this doesn't work right now, maybe we need to examine it
        #self.app.testing = True
        #self.client = app.test_client()
        
        # Initialize the test databases
        app.userDB.init_db_for_testing()
        app.msgDB.init_db_for_testing()
        
    
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
    def test_user_create(self):
        # CADEN: need to pass data{} to the app.user_create() function
        # to simulate a user creation request.
        app.user_create()
        
        users = app.get_all_users()
        
        self.assertEqual(len(users), 1, "User not created successfully")
        self.assertEqual(users[0]["username"], "testuser1", "Username mismatch")
        self.assertEqual(users[0]["password"], "password1", "Password mismatch")
        self.assertEqual(users[0]["status"], "online", "Status mismatch")
    
    
    
    
    
    #################
    # Channel Tests #
    #################
    
    
    
    
    
    
    
    
    
    #####################
    # User Status Tests #
    #####################








