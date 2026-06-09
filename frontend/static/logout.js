function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("adminLoggedIn");

    window.location.href =
        "admin-login.html";
}