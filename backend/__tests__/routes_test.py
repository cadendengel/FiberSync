import os
from dotenv import load_dotenv

# Manually load .env from the Fibersync root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(env_path)

# Initialize the databases for testing
from backend.src.UserDB import userDB
from backend.src.MessageDB import msgDB

from backend.src.app import app
import unittest
import json


class TestRoutes(unittest.TestCase):
    def setUp(self):
        userDB.init_db_for_testing()
        userDB.delete_all_users()
        
        
        msgDB.init_db_for_testing()
        
        # Have to make multiple cleanup attempts because it wasn't working with one???
        for _ in range(3):  # Retry cleanup up to 3 times :)
            existing_channels = msgDB.get_channels()
            for channel in existing_channels:
                if channel["name"] != "Home":  # Keep "Home" channel
                    msgDB.delete_channel(channel["name"])

            # Ensure all previous messages are deleted
            msgDB.delete_all_messages()

            # **Re-check the cleanup**
            channels = msgDB.get_channels()
            if len(channels) == 1 and channels[0]["name"] == "Home":
                break  # Exit loop if cleanup succeeded
        else:
            print("WARNING: Some channels are not getting deleted properly.")
            # Debug because dear god what is happening

        # Final assertion before tests start
        assert len(channels) == 1, f"Expected only 'Home' to exist, found: {channels}"
        assert channels[0]["name"] == "Home", f"Unexpected channel found: {channels}"
        assert msgDB.get_message_count() == 0, f"Expected 0 messages, found: {msgDB.get_message_count()}"

        self.app.testing = True
        self.client = app.test_client()
        
    
    @classmethod
    def tearDownClass(cls):
        userDB.delete_all_users()
        
        print("Final cleanup: Removing all test channels and messages")
        msgDB.delete_all_messages()
        msgDB.clear_all_channels()

        # Double-check that everything is cleared
        channels = msgDB.get_channels()
        assert len(channels) == 1, f"Expected only 'Home' to exist, found: {channels}"
        assert channels[0]["name"] == "Home"
        assert msgDB.get_message_count() == 0

        # **Close MongoDB Connection**
        msgDB.client.close()
        print("DEBUG: MongoDB connection closed after tests.")
        
    ################
    # UserDB Tests #
    ################
    
    
    
    
    
    
    #################
    # Channel Tests #
    #################
    
    
    
    
    
    
    
    
    
    #####################
    # User Status Tests #
    #####################
    
    
    
    
    
    
    
    
    