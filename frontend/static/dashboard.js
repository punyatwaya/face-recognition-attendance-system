
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const message = document.getElementById("message");


// --------------------------------------------------
// Start Camera
// --------------------------------------------------

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
             video: {
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                }
        });

        video.srcObject = stream;

    } catch (error) {

        console.error(error);

        alert("Cannot access camera");
    }
}

startCamera();


// --------------------------------------------------
// Dashboard Counts
// --------------------------------------------------

async function loadDashboardData() {

    try {

        // Total Students
        const totalRes = await fetch(
            "http://127.0.0.1:8000/students/count"
        );

        const totalData = await totalRes.json();

        document.getElementById(
            "totalStudents"
        ).innerText = totalData.total_students;


        // Present Today
        const presentRes = await fetch(
            "http://127.0.0.1:8000/students/verified/count"
        );

        const presentData = await presentRes.json();

        document.getElementById(
            "presentStudents"
        ).innerText = presentData.verified_today;


        // Absent Today
        const absentRes = await fetch(
            "http://127.0.0.1:8000/students/absent"
        );

        const absentData = await absentRes.json();

        document.getElementById(
            "absentStudents"
        ).innerText = absentData.length;

    } catch (error) {

        console.error(error);
    }
}

loadDashboardData();


// --------------------------------------------------
// Mark Attendance
// --------------------------------------------------

async function markAttendance() {

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(async function(blob) {
        if (!blob) {
        message.innerHTML = "Image capture failed";
        return;
    }
        const formData = new FormData();

        formData.append(
            "file",
            blob,
            "capture.jpg"
        );

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/verify",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();
            console.log(data);

            if (data.verified) {

                message.innerHTML =
                    `✅ Verified: ${data.name}`;

                loadDashboardData();

            } else {

                message.innerHTML =
                    "❌ Face Not Recognized";
            }

        } catch (error) {

            console.error(error);

            message.innerHTML =
                "Server Error";
        }

    }, "image/jpeg");
}

function logout(){

    localStorage.removeItem(
        "adminLoggedIn"
    );

    window.location.href =
        "admin-login.html";
}

if(
    localStorage.getItem("adminLoggedIn")
    !== "true"
){
    window.location.href =
        "admin-login.html";
}

const dailyCtx = document.getElementById('dailyChart');

new Chart(dailyCtx, {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Students Present',
            data: [25, 30, 28, 35, 32, 40],
            borderWidth: 2
        }]
    }
});

const monthlyCtx = document.getElementById('monthlyChart');

new Chart(monthlyCtx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Attendance',
            data: [500, 600, 550, 700, 650, 750],
            borderWidth: 1
        }]
    }
});