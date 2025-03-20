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


# Highjacking msgDB.py to test channel collection stuff

def add_channel(channel_name):
    if db.channels.count_documents({"name": channel_name}) >= 5:
        return False  # Limit to 5 channels

    db.channels.insert_one({"name": channel_name})
    return True

def get_channels():
    return list(db.channels.find({}, {"_id": 0, "name": 1}))  # Return only channel names

def delete_channel(channel_name):
    if channel_name == "Home":
        return False  # Prevent deletion of "Home"

    db.channels.delete_one({"name": channel_name})  # Remove channel from DB
    db.messages.delete_many({"channel": channel_name})  # Remove all messages in that channel
    return True