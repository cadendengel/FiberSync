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


    def test_robust(self):
        userDB.add_user("testuser", "testpassword", "session1")
        userDB.add_user("testuser2", "testpassword2", "session2")
        userDB.add_user("testuser3", "testpassword3", "session3")

        self.assertEqual(int(userDB.get_user_count()), 3)

        self.assertTrue(userDB.is_user_authenticated("testuser", "testpassword"))
        self.assertTrue(userDB.is_user_authenticated("testuser2", "testpassword2"))
        self.assertTrue(userDB.is_user_authenticated("testuser3", "testpassword3"))
        self.assertFalse(userDB.is_user_authenticated("testuser", "wrongpassword"))
        self.assertFalse(userDB.is_user_authenticated("testuser2", "wrongpassword"))
        self.assertFalse(userDB.is_user_authenticated("testuser3", "wrongpassword"))

        self.assertTrue(userDB.is_cookie_authenticated("session1"))
        self.assertTrue(userDB.is_cookie_authenticated("session2"))
        self.assertTrue(userDB.is_cookie_authenticated("session3"))
        self.assertFalse(userDB.is_cookie_authenticated("session4"))

        self.assertEqual(userDB.get_user_by_cookies("session1"), "testuser")
        self.assertEqual(userDB.get_user_by_cookies("session2"), "testuser2")
        self.assertEqual(userDB.get_user_by_cookies("session3"), "testuser3")

        self.assertEqual(userDB.get_user_by_username("testuser")["username"], "testuser")
        self.assertEqual(userDB.get_user_by_username("testuser2")["username"], "testuser2")
        self.assertEqual(userDB.get_user_by_username("testuser3")["username"], "testuser3")

        userDB.delete_user("testuser")
        self.assertEqual(int(userDB.get_user_count()), 2)
        userDB.delete_user("testuser4")
        self.assertEqual(int(userDB.get_user_count()), 2)
        userDB.delete_all_users()
        self.assertEqual(int(userDB.get_user_count()), 0)


    def test_salt(self):
        # salt should be different for different users
        # technically, this test could fail if the random salt is the same for two users
        # but the probability of that happening is very low
        userDB.add_user("testuser", "testpassword", "session1")
        userDB.add_user("testuser2", "testpassword2", "session2")
        userDB.add_user("testuser3", "testpassword3", "session3")
        
        self.assertNotEqual(userDB.get_user_by_username("testuser")["salt"], userDB.get_user_by_username("testuser2")["salt"])
        self.assertNotEqual(userDB.get_user_by_username("testuser")["salt"], userDB.get_user_by_username("testuser3")["salt"])
        self.assertNotEqual(userDB.get_user_by_username("testuser2")["salt"], userDB.get_user_by_username("testuser3")["salt"])