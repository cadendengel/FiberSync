# synchronous vs asynchronous database access
from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['userdb']


######################
# database functions #
######################
def init_db():
    pass

def get_user_count():
    return db.users.count_documents({})

def get_all_users():
    return db.users.find()

def get_user_by_username(username):
    return db.users.find_one({"username": username})

def temp_get_random_user():
    return db.users.aggregate([{ "$sample": { "size": 1 } }]).next()["username"]

def get_user_by_cookies(cookies):
    return db.users.find_one({"cookies": cookies})

def temp_add_user(username):
    db.users.insert_one({"username": username, "password": "password", "cookies": []})

def add_user(username, password, cookies):
    db.users.insert_one({"username": username, "password": password, "cookies": cookies})

def update_user_cookies(username, cookies):
    db.users.update_one({"username": username}, {"$set": {"cookies": cookies}})

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

##########################
# chat message functions #
##########################

def add_message(messageid, timestamp, user, text):
    db.messages.insert_one({
        "messageid": messageid,
        "timestamp": timestamp,
        "user": user,
        "text": text
    })

def get_all_messages():
    return db.messages.find()

def get_message_by_id(message_id):
    return db.messages.find_one({"messageid": message_id})

def get_messages_by_username(username):
    return db.messages.find({"username": username})

def delete_all_messages():
    db.messages.delete_many({})

def delete_message(messageid):
    db.messages.delete_one({"messageid": messageid})