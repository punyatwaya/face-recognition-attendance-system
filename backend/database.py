from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017/"

client = MongoClient(MONGO_URL)

db = client["face_attendance"]

student_collection = db["student"]
admin_collection = db["admin"]
attendance_collection = db["attendance"]