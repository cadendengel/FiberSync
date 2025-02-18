import unittest
from fibersync.frontend.Mongo.UserDB import database


class TestUserDB(unittest.IsolatedAsyncioTestCase):
    
    # this would never be used with the real data
    # it is purely used here for testing purposes
    def setUp(self):
        database.delete_all_users()
    
    @classmethod
    def tearDownClass(self):
        database.delete_all_users()
    
    
    def test_init_db(self):
        database.init_db()
        self.assertEqual(database.get_user_count(), 0)


    def test_add_user_and_get_user_count(self):
        database.init_db()
        database.add_user("testuser", "testpassword")
        self.assertEqual(database.get_user_count(), 1)
        database.add_user("testuser", "testpassword")
        self.assertEqual(database.get_user_count(), 1)
        database.add_user("testuser2", "testpassword2")
        database.add_user("testuser3", "testpassword3")
        self.assertEqual(database.get_user_count(), 3)
    
    
    def test_get_user_by_username(self):
        database.init_db()
        database.add_user("testuser", "testpassword")
        user = database.get_user_by_username("testuser")
        self.assertEqual(user["username"], "testuser")
        self.assertEqual(user["password"], "testpassword")