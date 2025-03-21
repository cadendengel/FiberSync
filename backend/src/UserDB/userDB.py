from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['userdb']


######################
# database functions #
######################
def init_db_for_testing():
    global db
    db = client['__test_userdb__']

def get_user_count():
    return db.users.count_documents({})

def get_all_users():
    return db.users.find()

def get_user_by_username(username):
    return db.users.find_one({"username": username})

def get_uuid_by_username(username):
    return db.users.find_one({"username": username})["_id"]

# LIKELY NOT NEEDED
def temp_get_random_user():
    return db.users.aggregate([{ "$sample": { "size": 1 } }]).next()["username"]

def get_user_by_cookies(cookies):
    user = db.users.find_one({"cookies": cookies})
    return user["username"] if user else None

def add_user(username, password, cookies):
    db.users.insert_one({"username": username, "password": password, "cookies": cookies})

def update_user_cookies(username, cookies):
    db.users.update_one({"username": username}, {"$push": {"cookies": cookies}}) #BUG: cookies is a string; it should be an "array" according to mongodb. I currently have absolutely no idea how to fix this, as I have tried literally everything.
    
def is_cookie_authenticated(cookies):
    for user in db.users.find():
        if user["cookies"] == cookies:
            return True
    return False

def is_user_authenticated(username, password):
    user = db.users.find_one({"username": username, "password": password})
    return user is not None

def delete_user(username):
    db.users.delete_one({"username": username})
    
def delete_all_users():
    db.users.delete_many({})