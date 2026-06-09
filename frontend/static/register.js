const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const btn = document.getElementById("registerBtn");
const message = document.getElementById("message");

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;
    } catch (error) {
        console.error(error);
        alert("❌ Camera access denied");
    }
}

startCamera();

btn.addEventListener("click", async (e) => {

    e.preventDefault();
    e.stopPropagation();

    alert(" Register succesfully ✅");

    const name = document.getElementById("name").value.trim();
    const userid = document.getElementById("userid").value.trim();

    if (!name || !userid) {
        alert("❌ Please enter Name and User ID");
        return;
    }

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    

    canvas.toBlob(async (blob) => {

        try {

            const formData = new FormData();

            formData.append("name", name);
            formData.append("userid", userid);
            formData.append("file", blob, "face.jpg");

            

            const response = await fetch(
                "http://127.0.0.1:8000/register",
                {
                    method: "POST",
                    body: formData
                }
            );


            const text = await response.text();

        

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }

            if (response.ok) {

                message.innerHTML =
                    data.message || "Registered Successfully";

                alert("✅ Student Registered Successfully");

            } else {

                message.innerHTML =
                    data.detail || "Registration Failed";

                alert(
                    "❌ Registration Failed\n\n" +
                    (data.detail || "Unknown Error")
                );
            }

        } catch (error) {

            console.error(error);

            message.innerHTML = "Registration Failed";

            alert(
                "❌ Registration Error\n\n" +
                error.message
            );
        }

    }, "image/jpeg");
});

const today = new Date();

const formattedDate = today.toLocaleDateString(
    "en-IN",
    {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }
);

document.getElementById("date").value = formattedDate;
document.getElementById("currentDate").innerText = formattedDate;