
const LOGIN_PAGE = "index.html";

function checkLogin(requiredRole) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || !role) {
        window.location.replace(LOGIN_PAGE);
        return false;
    }

    if (requiredRole && role !== requiredRole) {
        window.location.replace(LOGIN_PAGE);
        return false;
    }

    return true;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    window.location.replace(LOGIN_PAGE);
}
