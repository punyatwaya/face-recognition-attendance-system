from database import admin_collection

admin_collection.insert_one({
    "username": "admin",
    "password": "admin123"
})

print("Admin Created Successfully")