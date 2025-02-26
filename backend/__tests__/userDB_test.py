import unittest
from backend.src.UserDB import userDB

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
        userDB.add_user("testuser", "testpassword", [])
        self.assertEqual(userDB.get_user_count(), 1)
        userDB.add_user("testuser", "testpassword", [])
        self.assertEqual(userDB.get_user_count(), 2)
        userDB.add_user("testuser2", "testpassword2", [])
        userDB.add_user("testuser3", "testpassword3", [])
        self.assertEqual(userDB.get_user_count(), 4)
    
    
    def test_get_user_by_username(self):
        userDB.add_user("testuser", "testpassword", [])
        user = userDB.get_user_by_username("testuser")
        self.assertEqual(user["username"], "testuser")
        self.assertEqual(user["password"], "testpassword")
        self.assertEqual(user["cookies"], [])