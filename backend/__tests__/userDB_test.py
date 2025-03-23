import unittest
from backend.src.UserDB import userDB
import hashlib

# Run all tests:
# python -m unittest discover -s ./backend/__tests__ -p *_test.py

# Run this test:
# python -m unittest discover -s ./backend/__tests__ -p userDB_test.py

class TestUserDB(unittest.IsolatedAsyncioTestCase):
    
    def setUp(self):
        userDB.init_db_for_testing()
        userDB.delete_all_users()
    
    @classmethod
    def tearDownClass(self):
        userDB.delete_all_users()
    
    def test_init_db(self):
        self.assertEqual(userDB.get_user_count(), 0)


    def test_add_user_and_get_user_count(self):
        userDB.add_user("testuser", "testpassword", "session1")
        self.assertEqual(userDB.get_user_count(), 1)
        userDB.add_user("testuser", "testpassword", "session2")
        self.assertEqual(userDB.get_user_count(), 2)
        userDB.add_user("testuser2", "testpassword2", "session2")
        userDB.add_user("testuser3", "testpassword3", "session3")
        self.assertEqual(userDB.get_user_count(), 4)
    
    
    def test_get_user_by_username(self):
        userDB.add_user("testuser", "testpassword", "session1")
        user = userDB.get_user_by_username("testuser")
        self.assertEqual(user["username"], "testuser")
        self.assertEqual(user["hashed_password"], hashlib.pbkdf2_hmac('sha256', "testpassword".encode('utf-8'), user["salt"], 10000))
        self.assertEqual(user["cookies"], ["session1"])


    def test_get_user_by_cookies(self):
        userDB.add_user("testuser", "testpassword", "session1")
        user = userDB.get_user_by_cookies("session1")
        self.assertEqual(user, "testuser")

        userDB.update_user_cookies("testuser", "session2")
        user = userDB.get_user_by_cookies("session2")
        self.assertEqual(user, "testuser")

    
    def test_is_cookie_authenticated(self):
        userDB.add_user("testuser", "testpassword", "session1")
        self.assertTrue(userDB.is_cookie_authenticated("session1"))
        self.assertFalse(userDB.is_cookie_authenticated("session2"))


    def test_is_user_authenticated(self):
        userDB.add_user("testuser", "testpassword", "session1")
        self.assertTrue(userDB.is_user_authenticated("testuser", "testpassword"))
        self.assertFalse(userDB.is_user_authenticated("testuser", "wrongpassword"))