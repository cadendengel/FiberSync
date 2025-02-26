import unittest
from backend.src.MessageDB import msgDB

class TestMsgDB(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        msgDB.create_collection("test_message_db")

    @classmethod
    def tearDownClass(self):
        msgDB.delete_all_messages()

    def test_add_message(self):
        msgDB.add_message("test_message_id", "test_timestamp", "test_user", "test_text")
        message = msgDB.get_message_by_id("test_message_id")
        self.assertEqual(message["messageid"], "test_message_id")
        self.assertEqual(message["timestamp"], "test_timestamp")
        self.assertEqual(message["user"], "test_user")
        self.assertEqual(message["text"], "test_text")

    def test_get_all_messages(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2")
        messages = msgDB.get_all_messages()
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["messageid"], "test_message_id1")
        self.assertEqual(messages[1]["messageid"], "test_message_id2")
        self.assertEqual(messages[0]["timestamp"], "test_timestamp1")
        self.assertEqual(messages[1]["timestamp"], "test_timestamp2")
        self.assertEqual(messages[0]["user"], "test_user1")
        self.assertEqual(messages[1]["user"], "test_user2")
        self.assertEqual(messages[0]["text"], "test_text1")
        self.assertEqual(messages[1]["text"], "test_text2")

    def test_get_messages_by_username(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2")
        messages = msgDB.get_messages_by_username("test_user1")
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["messageid"], "test_message_id1")
        self.assertEqual(messages[0]["timestamp"], "test_timestamp1")
        self.assertEqual(messages[0]["user"], "test_user1")
        self.assertEqual(messages[0]["text"], "test_text1")

        messages = msgDB.get_messages_by_username("test_user2")
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["messageid"], "test_message_id2")
        self.assertEqual(messages[0]["timestamp"], "test_timestamp2")
        self.assertEqual(messages[0]["user"], "test_user2")
        self.assertEqual(messages[0]["text"], "test_text2")

    def test_delete_all_messages(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2")
        msgDB.delete_all_messages()
        messages = msgDB.get_all_messages()
        self.assertEqual(len(messages), 0)

    def test_delete_message(self):
        msgDB.add_message("test_message_id1", "test_timestamp1", "test_user1", "test_text1")
        msgDB.add_message("test_message_id2", "test_timestamp2", "test_user2", "test_text2")
        msgDB.delete_message("test_message_id1")
        messages = msgDB.get_all_messages()
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["messageid"], "test_message_id2")
        self.assertEqual(messages[0]["timestamp"], "test_timestamp2")
        self.assertEqual(messages[0]["user"], "test_user2")
        self.assertEqual(messages[0]["text"], "test_text2")
        msgDB.delete_message("test_message_id2")
        messages = msgDB.get_all_messages()
        self.assertEqual(len(messages), 0)