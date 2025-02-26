from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['messagedb']

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