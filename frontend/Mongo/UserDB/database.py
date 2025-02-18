# synchronous vs asynchronous database access
from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['userdb']


#############################
# Global Database Functions #
#############################
def init_db():
    pass

###########################
# User Database Functions #
###########################

def get_user_count():
    return db.users.count_documents({})

def get_user_by_username(username):
    return db.users.find_one({"username": username})

def add_user(username, password):
    db.users.insert_one({"username": username, "password": password})
    
def delete_all_users():
    db.users.delete_many({})

##############################
# Message Database Functions #
##############################

def store_message(messageid, userid, timestamp, message):
    db.messages.insert_one({"messageid": messageid, 
                            "timestamp": timestamp, 
                            "username": userid, 
                            "message": message})
    
def get_message_by_id(messageid):
    return db.messages.find_one({"messageid": messageid})

def get_messages_by_user(userid):
    return db.messages.find({"username": userid})

def get_messages_since(timestamp):
    return db.messages.find({"timestamp": {"$gt": timestamp}}) # $gt = greater than