from pymongo import MongoClient
from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()

client = MongoClient(os.getenv('MONGODB_LOGIN'))
db = client['messagedb']

##########################
# chat message functions #
##########################

def init_db_for_testing():
    global db
    db = client['__test_messagedb__']

def add_message(messageid, timestamp, user, text, channel):
    db.messages.insert_one({
        "messageid": messageid,
        "timestamp": timestamp,
        "user": user,
        "text": text,
        "channel": channel          # Working with adding a channel tag over having channel specific collections
    })

def get_messages_by_channel(channel_name):
    messages = db.messages.find({"channel": channel_name})
    result = []
    for message in messages:
        message["_id"] = str(message["_id"])  # Convert ObjectId to string
        result.append(message)

    return result

def get_all_messages():
    messages = db.messages.find()
    result = []
    for message in messages:
        message["_id"] = str(message["_id"])  # Convert ObjectId to string
        result.append(message)

    return result

def get_message_by_id(message_id):
    return db.messages.find_one({"messageid": message_id})

def get_messages_by_username(username):
    return db.messages.find({"username": username})

def get_message_count():
    return db.messages.count_documents({})

def delete_all_messages():
    db.messages.delete_many({})

def delete_message(messageid):
    db.messages.delete_one({"messageid": messageid})