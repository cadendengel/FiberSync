from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os
import hashlib

load_dotenv()

client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['userdb']


###########################
# user database functions #
###########################
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
def get_random_user():
    return db.users.aggregate([{ "$sample": { "size": 1 } }]).next()["username"]

def get_user_by_cookies(cookies):
    user = db.users.find_one({"cookies": cookies})
    return user["username"] if user else None

def get_salt_by_username(username):
    return db.users.find_one({"username": username})["salt"]

def add_user(username, password, cookies):
    # generate salt
    salt = os.urandom(16)

    # hash password with salt
    hashed_password = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 10000)

    # add user
    db.users.insert_one({"username": username, "salt": salt, "hashed_password": hashed_password, "cookies": [cookies], "status": "online"})

def update_user_cookies(username, cookies):
    db.users.update_one({"username": username}, {"$addToSet": {"cookies": cookies}})

def is_cookie_authenticated(cookies):
    for user in db.users.find():
        if cookies in user["cookies"]:
            return True
    return False

def is_user_authenticated(username, password):
    # get salt
    salt = get_salt_by_username(username)

    # hash password with salt
    hashed_password = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 10000)

    # check if user exists with hashed password
    user = db.users.find_one({"username": username, "hashed_password": hashed_password})

    return user is not None

def delete_user(username):
    db.users.delete_one({"username": username})
    
def delete_all_users():
    db.users.delete_many({})


#########################
# user status functions #
#########################

def update_status(username, status):
    db.users.update_one({"username": username}, {"$set": {"status": status}})

def get_user_status(username):
    return db.users.find_one({"username": username})["status"]