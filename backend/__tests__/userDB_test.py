import unittest
from backend.src.UserDB import userDB


class TestUserDB(unittest.IsolatedAsyncioTestCase):
    
    # this would never be used with the real data
    # it is purely used here for testing purposes
    def setUp(self):
        userDB.delete_all_users()
    
    @classmethod
    def tearDownClass(self):
        userDB.delete_all_users()
    
    
    def test_init_db(self):
        userDB.init_db()
        self.assertEqual(userDB.get_user_count(), 0)


    def test_add_user_and_get_user_count(self):
        userDB.init_db()
        userDB.add_user("testuser", "testpassword")
        self.assertEqual(userDB.get_user_count(), 1)
        userDB.add_user("testuser", "testpassword")
        self.assertEqual(userDB.get_user_count(), 1)
        userDB.add_user("testuser2", "testpassword2")
        userDB.add_user("testuser3", "testpassword3")
        self.assertEqual(userDB.get_user_count(), 3)
    
    
    def test_get_user_by_username(self):
        userDB.init_db()
        userDB.add_user("testuser", "testpassword")
        user = userDB.get_user_by_username("testuser")
        self.assertEqual(user["username"], "testuser")
        self.assertEqual(user["password"], "testpassword")