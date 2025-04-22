import unittest
from backend.src.MessageDB import msgDB


# Run all tests:
# python -m unittest discover -s ./backend/__tests__ -p *_test.py

# Run this test:
# python -m unittest discover -s ./backend/__tests__ -p msgDB_test.py



class TestMsgDB(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        msgDB.init_db_for_testing()
        msgDB.delete_all_messages()

    @classmethod
    def tearDownClass(self):
        msgDB.delete_all_messages()

    def test_add_message(self):
        msgDB.add_message("test_message_id", "test_timestamp", "test_user", "test_text", "test_channel")
        message = msgDB.get_message_by_id("test_message_id")
        self.assertEqual(message["messageid"], "test_message_id")
        self.assertEqual(message["timestamp"], "test_timestamp")
        self.assertEqual(message["user"], "test_user")
        self.assertEqual(message["text"], "test_text")
        self.assertEqual(message["channel"], "test_channel")

    def test_get_all_messages(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1", "test_channel1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2", "test_channel2")
        messages = msgDB.get_all_messages()
        self.assertEqual(msgDB.get_message_count(), 2)
        self.assertEqual(messages[0]["messageid"], "test_message_id1")
        self.assertEqual(messages[1]["messageid"], "test_message_id2")
        self.assertEqual(messages[0]["timestamp"], "test_timestamp1")
        self.assertEqual(messages[1]["timestamp"], "test_timestamp2")
        self.assertEqual(messages[0]["user"], "test_user1")
        self.assertEqual(messages[1]["user"], "test_user2")
        self.assertEqual(messages[0]["text"], "test_text1")
        self.assertEqual(messages[1]["text"], "test_text2")
        self.assertEqual(messages[0]["channel"], "test_channel1")
        self.assertEqual(messages[1]["channel"], "test_channel2")

    def test_delete_all_messages(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1", "test_channel1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2", "test_channel2")
        msgDB.delete_all_messages()
        messages = msgDB.get_all_messages()
        self.assertEqual(msgDB.get_message_count(), 0)

    def test_delete_message(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1", "test_channel1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2", "test_channel2")
        msgDB.delete_message("test_message_id1")
        messages = msgDB.get_all_messages()
        self.assertEqual(msgDB.get_message_count(), 1)
        self.assertEqual(messages[0]["messageid"], "test_message_id2")
        self.assertEqual(messages[0]["timestamp"], "test_timestamp2")
        self.assertEqual(messages[0]["user"], "test_user2")
        self.assertEqual(messages[0]["text"], "test_text2")
        self.assertEqual(messages[0]["channel"], "test_channel2")
        msgDB.delete_message("test_message_id2")
        messages = msgDB.get_all_messages()
        self.assertEqual(msgDB.get_message_count(), 0)
        
    def test_add_reaction(self):
        msgDB.add_message("test_message_id", "test_timestamp", "test_user", "test_text", "test_channel")
        msgDB.add_emoji_to_message("test_message_id", "👍")
        reaction = msgDB.get_emoji_count_by_messageid("test_message_id", "👍")
        self.assertEqual(reaction, 1)
        
    def test_remove_reaction(self):
        msgDB.add_message("test_message_id", "test_timestamp", "test_user", "test_text", "test_channel")
        msgDB.add_emoji_to_message("test_message_id", "👍")
        reaction = msgDB.get_emoji_count_by_messageid("test_message_id", "👍")
        self.assertEqual(reaction, 1)
        msgDB.remove_emoji_from_reactions("test_message_id", "👍")
        reaction = msgDB.get_emoji_count_by_messageid("test_message_id", "👍")
        self.assertEqual(reaction, 0)
        
        
    def test_get_reactions_by_messageid(self):
        msgDB.add_message("test_message_id", "test_timestamp", "test_user", "test_text", "test_channel")
        msgDB.add_emoji_to_message("test_message_id", "👍")
        msgDB.add_emoji_to_message("test_message_id", "👎")
        reactions = msgDB.get_reactions_by_messageid("test_message_id")
        self.assertEqual(reactions["👍"], 1)
        self.assertEqual(reactions["👎"], 1)
        