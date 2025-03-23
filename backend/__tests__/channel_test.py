import os
from dotenv import load_dotenv

# Manually load .env from the Fibersync root directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(env_path)

from src.app import app
from src.MessageDB import msgDB
import unittest
import json

# Run all tests:
# python -m unittest discover -s ./backend/__tests__ -p *_test.py

# Run this test:
# python -m unittest discover -s ./backend/__tests__ -p channel_test.py


class TestChannelSwitching(unittest.TestCase):
    def setUp(self):
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

        self.client = app.test_client()


    @classmethod
    def tearDownClass(cls):
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

    def test_create_channel(self):
        response = self.client.post('/api/channels/create', json={"name": "TestChannel"})
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data["name"], "TestChannel")

        # Debugging: Print the channels to see what's in the DB before asserting
        channels = msgDB.get_channels()
        print("DEBUG: Current channels in DB before assertion:", channels)  

        # Verify channel exists in DB
        self.assertEqual(len(channels), 2)  # Expect "Home" + "TestChannel"
        self.assertEqual(channels[1]["name"], "TestChannel")  # Expect the new channel to be the second one

    def test_switch_channels_and_fetch_messages(self):
        # Create two channels
        self.client.post('/api/channels/create', json={"name": "Channel1"})
        self.client.post('/api/channels/create', json={"name": "Channel2"})

        # Add messages to Channel1
        msgDB.add_message("msg1", "timestamp1", "user1", "Hello Channel1!", "Channel1")
        msgDB.add_message("msg2", "timestamp2", "user2", "Welcome to Channel1", "Channel1")

        # Add messages to Channel2
        msgDB.add_message("msg3", "timestamp3", "user3", "Channel2 is cool!", "Channel2")

        # Switch to Channel1 and verify messages
        response = self.client.get('/api/messages/Channel1')
        self.assertEqual(response.status_code, 200)
        messages = response.get_json()
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["text"], "Hello Channel1!")
        self.assertEqual(messages[1]["text"], "Welcome to Channel1")

        # Switch to Channel2 and verify messages
        response = self.client.get('/api/messages/Channel2')
        self.assertEqual(response.status_code, 200)
        messages = response.get_json()
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["text"], "Channel2 is cool!")

    def test_switch_to_empty_channel(self):
        self.client.post('/api/channels/create', json={"name": "EmptyChannel"})

        response = self.client.get('/api/messages/EmptyChannel')
        self.assertEqual(response.status_code, 200)
        messages = response.get_json()
        self.assertEqual(messages, [])  # Expect an empty list

    def test_switch_to_non_existent_channel(self):
        response = self.client.get('/api/messages/NonExistentChannel')
        self.assertEqual(response.status_code, 200)  # Should not crash
        messages = response.get_json()
        self.assertEqual(messages, [])  # Expect empty response

    def test_delete_channel_and_check_messages(self):
        self.client.post('/api/channels/create', json={"name": "DeleteMe"})
        msgDB.add_message("msg1", "timestamp1", "user1", "This message will be deleted", "DeleteMe")

        # Verify message exists
        messages = msgDB.get_messages_by_channel("DeleteMe")
        self.assertEqual(len(messages), 1)

        # Delete channel
        self.client.delete('/api/channels/delete', json={"name": "DeleteMe"})

        # Verify channel is removed
        channels = msgDB.get_channels()
        self.assertEqual(len(channels), 1)
        self.assertEqual(channels[0]["name"], "Home")

        # Verify messages in deleted channel are removed
        messages = msgDB.get_messages_by_channel("DeleteMe")
        self.assertEqual(len(messages), 0)

if __name__ == "__main__":
    unittest.main()