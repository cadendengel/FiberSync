from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os
import hashlib
import time

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

# Generally useless in this project since we don't ever use UUIDs
def get_uuid_by_username(username):
    return db.users.find_one({"username": username})["_id"]

def get_timestamp_by_username(username):
    return db.users.find_one({"username": username})["timestamp"]

def get_description_by_username(username):
    return db.users.find_one({"username": username})["description"]

# LIKELY NOT NEEDED
def get_random_user():
    return db.users.aggregate([{ "$sample": { "size": 1 } }]).next()["username"]

def get_user_by_cookies(cookies):
    user = db.users.find_one({"cookies": cookies})
    return user["username"] if user else None

def get_salt_by_username(username):
    return db.users.find_one({"username": username})["salt"]

def add_user(username, password, cookies):
    # generate timestamp
    timestamp = int(time.time())
    
    # generate salt
    salt = os.urandom(16)

    # hash password with salt
    hashed_password = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 10000)

    # add user
    db.users.insert_one({"username": username, "salt": salt, "hashed_password": hashed_password, "timestamp": timestamp, "description": "", "cookies": [cookies], "status": "online"})

def update_description(username, description):
    db.users.update_one({"username": username}, {"$set": {"description": description}})

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

def delete_duplicate_users():
    """Delete duplicate user documents by username, keeping the oldest record.

    Returns:
        int: Number of duplicate documents removed.
    """
    deleted_count = 0

    # Group by username and keep the first inserted document (smallest _id).
    duplicate_groups = db.users.aggregate([
        {"$sort": {"_id": 1}},
        {
            "$group": {
                "_id": "$username",
                "ids": {"$push": "$_id"},
                "count": {"$sum": 1}
            }
        },
        {"$match": {"count": {"$gt": 1}}}
    ])

    for group in duplicate_groups:
        duplicate_ids = group["ids"][1:]
        if duplicate_ids:
            result = db.users.delete_many({"_id": {"$in": duplicate_ids}})
            deleted_count += result.deleted_count

    return deleted_count


#########################
# user status functions #
#########################

def update_status(username, status):
    db.users.update_one({"username": username}, {"$set": {"status": status}})

def get_user_status(username):
    return db.users.find_one({"username": username})["status"]