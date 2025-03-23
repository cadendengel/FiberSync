import unittest
from backend.src.MessageDB import msgDB

# Run all tests:
# python -m unittest discover -s ./backend/__tests__ -p *_test.py

# Run this test:
# python -m unittest discover -s ./backend/__tests__ -p channel_test.py


class TestChannelDB(unittest.TestCase):

    def setUp(self):
        """Initialize database for testing and clear any existing channels/messages."""
        msgDB.init_db_for_testing()
        msgDB.delete_all_messages()
        msgDB.clear_all_channels()

    @classmethod
    def tearDownClass(cls):
        """Ensure cleanup after all tests run."""
        msgDB.delete_all_messages()
        msgDB.clear_all_channels()

    def test_add_channel(self):
        """Test if a channel can be created successfully."""
        result = msgDB.add_channel("TestChannel")
        self.assertTrue(result)

        channels = msgDB.get_channels()
        self.assertEqual(len(channels), 1)
        self.assertEqual(channels[0]["name"], "TestChannel")

    def test_add_channel_limit(self):
        """Test that adding more than 5 channels fails."""
        for i in range(5):
            self.assertTrue(msgDB.add_channel(f"Channel{i+1}"))

        self.assertFalse(msgDB.add_channel("ExceedLimitChannel"))  # 6th channel should fail

    def test_get_channels(self):
        """Test retrieving all available channels."""
        msgDB.add_channel("TestChannel1")
        msgDB.add_channel("TestChannel2")
        
        channels = msgDB.get_channels()
        self.assertEqual(len(channels), 2)
        self.assertIn({"name": "TestChannel1"}, channels)
        self.assertIn({"name": "TestChannel2"}, channels)

    def test_add_messages_to_channel(self):
        """Test adding messages to a channel and retrieving them."""
        msgDB.add_channel("TestChannel")
        msgDB.add_message("msg1", "timestamp1", "user1", "Hello World!", "TestChannel")
        msgDB.add_message("msg2", "timestamp2", "user2", "Hey there!", "TestChannel")

        messages = msgDB.get_messages_by_channel("TestChannel")
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["text"], "Hello World!")
        self.assertEqual(messages[1]["text"], "Hey there!")

    def test_clear_channel(self):
        """Test clearing all messages in a specific channel."""
        msgDB.add_channel("TestChannel")
        msgDB.add_message("msg1", "timestamp1", "user1", "Hello!", "TestChannel")
        msgDB.add_message("msg2", "timestamp2", "user2", "Hey!", "TestChannel")

        self.assertEqual(len(msgDB.get_messages_by_channel("TestChannel")), 2)

        msgDB.clear_channel("TestChannel")
        messages = msgDB.get_messages_by_channel("TestChannel")
        self.assertEqual(len(messages), 0)

    def test_delete_channel(self):
        """Test deleting a channel and ensuring associated messages are also deleted."""
        msgDB.add_channel("TestChannel")
        msgDB.add_message("msg1", "timestamp1", "user1", "Hello!", "TestChannel")

        self.assertEqual(len(msgDB.get_messages_by_channel("TestChannel")), 1)

        result = msgDB.delete_channel("TestChannel")
        self.assertTrue(result)

        channels = msgDB.get_channels()
        messages = msgDB.get_messages_by_channel("TestChannel")

        self.assertEqual(len(channels), 0)
        self.assertEqual(len(messages), 0)  # Ensure messages in the deleted channel are also removed

    def test_delete_protected_channel(self):
        """Test preventing deletion of the 'Home' channel."""
        msgDB.add_channel("Home")
        result = msgDB.delete_channel("Home")
        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()
