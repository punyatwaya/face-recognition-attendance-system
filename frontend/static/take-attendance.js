

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

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
// Mark Attendance
// --------------------------------------------------

async function markAttendance() {

    alert("Attendance Done");

    try {

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

        const blob = await new Promise(resolve =>
            canvas.toBlob(resolve, "image/jpeg")
        );

      

        const formData = new FormData();

        formData.append(
            "file",
            blob,
            "capture.jpg"
        );

        

        const response = await fetch(
            "http://127.0.0.1:8000/verify",
            {
                method: "POST",
                body: formData
            }
        );

     

        const data = await response.json();

        console.log("API Response:", data);

        alert("API Response: " + JSON.stringify(data));

        if (data.verified) {

            alert(
                data.message ||
                `${data.name} Attendance Marked Successfully`
            );

        } else {

            alert(
                data.message || "Face not recognized"
            );
        }

    } catch (error) {

        console.error(error);
        alert("ERROR: " + error.message);
    }
}