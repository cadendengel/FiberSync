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

def add_user(username, password, cookies):
    db.users.insert_one({"username": username, "password": password, "cookies": cookies})

def update_user_cookies(username, cookies):
    db.users.update_one({"username": username}, {"$set": {"cookies": cookies}})

def delete_user(username):
    db.users.delete_one({"username": username})
    
def delete_all_users():
    db.users.delete_many({})