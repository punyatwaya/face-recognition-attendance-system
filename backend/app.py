# app.py
from fastapi import  Form
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import attendance_collection
from pathlib import Path
from auth import create_access_token
from fastapi import Body
from fastapi.responses import FileResponse
import pandas as pd

from datetime import datetime
import shutil
import os

from database import admin_collection
# print(admin_collection.count_documents({}))
# print(admin_collection.find_one())
from database import student_collection
from face_engine import get_embedding, compare_faces


# ---------------------------------------------------
# FastAPI App
# ---------------------------------------------------

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent


# ---------------------------------------------------
# CORS
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# Upload Folder
# ---------------------------------------------------

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------
# Static Files
# ---------------------------------------------------

app.mount(
    "/static",
    StaticFiles(
        directory=str(BASE_DIR.parent / "frontend" / "static")
    ),
    name="static"
)

app.mount(
    "/frontend",
    StaticFiles(
        directory=str(BASE_DIR.parent / "frontend")
    ),
    name="frontend"
)


# ---------------------------------------------------
# Home Route
# ---------------------------------------------------

@app.get("/")
def home():
    return FileResponse(
        str(BASE_DIR.parent / "frontend" / "dashboard.html")
    )

# ---------------------------------------------------
# Register Student
# ---------------------------------------------------

@app.post("/register")
async def register_student(
    name: str = Form(...),
    userid: str = Form(...),
    file: UploadFile = File(...)
):

    existing = student_collection.find_one({
        "userid": userid
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="userid already exists"
        )

    file_path = f"{UPLOAD_DIR}/{userid}.jpg"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    embedding = get_embedding(file_path)

    if embedding is None:
        raise HTTPException(
            status_code=400,
            detail="No face detected"
        )

    now = datetime.now()

    student_data = {
        "name": name,
        "userid": userid,
        "registration_date": now.strftime("%d-%m-%Y"),
        "registration_time": now.strftime("%H:%M:%S"),
        "location": "Bhubaneswar",
        "verified_today": False,
        "embedding": embedding.tolist(),
        "verification_time": None
    }
    print(student_data)
    student_collection.insert_one(student_data)

    return {
        "success": True,
        "message": "Student registered successfully"
    }

# ---------------------------------------------------
# Verify Student
# ---------------------------------------------------

@app.post("/verify")
async def verify_student(
    file: UploadFile = File(...)
):

    file_path = f"{UPLOAD_DIR}/verify.jpg"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    embedding = get_embedding(file_path)

    if embedding is None:
        raise HTTPException(
            status_code=400,
            detail="No face detected"
        )

    students = list(
        student_collection.find({})
    )

    if len(students) == 0:

        return {
            "verified": False,
            "message": "No registered students"
        }

    match, score = compare_faces(
        embedding,
        students
    )

    if match is None or score < 0.45:

        return {
            "verified": False,
            "message": "Face not recognized"
        }

    student_collection.update_one(
        {"userid": match["userid"]},
        {
            "$set": {
                "verified_today": True,
                "verification_time": datetime.utcnow()
            }
        }
    )
    today = datetime.now()
    today_date = datetime.now().strftime("%d-%m-%Y")

    already_marked = attendance_collection.find_one({
    "userid": match["userid"],
    "date": today_date
    })

    if already_marked:
        
    
        return {
        "verified": True,
        "userid": match["userid"],
        "name": match["name"],
        "message": "Attendance already marked today"
        }

    

    attendance_collection.insert_one({
     "userid": match["userid"],
     "name": match["name"],
     "date": today.strftime("%d-%m-%Y"),
     "time": today.strftime("%H:%M:%S"),
     "status": "Present"
    })

    return {
        "verified": True,
        "userid": match["userid"],
        "name": match["name"],
        "confidence": float(score)
    }


# ---------------------------------------------------
# Get All Students
# ---------------------------------------------------

@app.get("/students")
def get_students():

    students = list(
        student_collection.find(
            {},
            {
                "_id": 0,
                "embedding": 0
            }
        )
    )

    return students


# ---------------------------------------------------
# Total Students Count
# ---------------------------------------------------

@app.get("/students/count")
def count_students():

    count = student_collection.count_documents({})

    return {
        "total_students": count
    }


# ---------------------------------------------------
# Verified Today Count
# ---------------------------------------------------

@app.get("/students/verified/count")
def verified_today_count():

    count = student_collection.count_documents({
        "verified_today": True
    })

    return {
        "verified_today": count
    }


# ---------------------------------------------------
# Absent Students
# ---------------------------------------------------

@app.get("/students/absent")
def absent_students():

    students = list(
        student_collection.find(
            {"verified_today": False},
            {
                "_id": 0,
                "embedding": 0
            }
        )
    )


    return students 

@app.get("/register-page")
def register_page():
    return FileResponse("../frontend/register.html")


@app.get("/students-page")
def students_page():
    return FileResponse("../frontend/student.html")

@app.get("/attendance")
def get_attendance():

    students = list(
        student_collection.find(
            {},
            {
                "_id": 0,
                "userid": 1,
                "name": 1,
                "verified_today": 1,
                "verification_time": 1
            }
        )
    )

    attendance_data = []

    for student in students:

        attendance_data.append({
            "userid": student.get("userid"),
            "name": student.get("name"),
            "date": datetime.now().strftime("%d-%m-%Y"),
            "status": "Present" if student.get("verified_today") else "Absent"
        })

    return attendance_data
@app.post("/admin/login")
async def admin_login(
    username: str = Form(...),
    password: str = Form(...)
):

    admin = admin_collection.find_one({
        "username": username,
        "password": password
    })

    if not admin:
        print("Found Admin:", admin)
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({
        "sub": username
    })

    return {
        "success": True,
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
  
    }
@app.get("/check-admin")
def check_admin():

    admin = admin_collection.find_one(
        {},
        {"_id": 0}
    )

    return admin if admin else {
        "message": "No admin found"
    }


@app.get("/report/daily")
def daily_report():

    today = datetime.now().strftime("%d-%m-%Y")

    report = list(
        attendance_collection.find(
            {"date": today},
            {"_id": 0}
        )
    )

    return report

@app.get("/report/monthly")
def monthly_report():

    month = datetime.now().strftime("%m-%Y")

    report = []

    records = attendance_collection.find({})

    for record in records:

        if record["date"][3:] == month:

            report.append({
                "userid": record["userid"],
                "name": record["name"],
                "date": record["date"],
                "status": record["status"]
            })

    return report
@app.delete("/students/{userid}")
def delete_student(userid: str):

    student = student_collection.find_one({
        "userid": userid
    })

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    student_collection.delete_one({
        "userid": userid
    })

    return {
        "success": True,
        "message": "Student deleted successfully"
    }

@app.put("/students/{userid}")
def update_student(
    userid: str,
    data: dict = Body(...)
):

    result = student_collection.update_one(
        {"userid": userid},
        {
            "$set": {
                "name": data["name"]
            }
        }
    )

    if result.modified_count == 0:
        return {
            "message": "No changes made"
        }

    return {
        "message": "Student updated successfully"
    }

@app.get("/report/export/excel")
def export_excel():

    records = list(
        attendance_collection.find(
            {},
            {"_id": 0}
        )
    )

    if len(records) == 0:
        return {"message": "No attendance data found"}

    df = pd.DataFrame(records)

    file_name = "attendance_report.xlsx"

    df.to_excel(
        file_name,
        index=False
    )

    return FileResponse(
        file_name,
        filename=file_name
    )