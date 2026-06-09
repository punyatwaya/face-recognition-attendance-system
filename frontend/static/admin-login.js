document
.getElementById("loginForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append(
        "username",
        document.getElementById("username").value
    );

    formData.append(
        "password",
        document.getElementById("password").value
    );

    const response = await fetch(
        "http://127.0.0.1:8000/admin/login",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (response.ok) {

        localStorage.setItem(
            "adminLoggedIn",
            "true"
        );

        localStorage.setItem(
            "token",
            data.access_token
        );

        window.location.href =
            "dashboard.html";

    } else {

        alert(data.detail);

    }

});