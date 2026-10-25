const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "API request failed.");
    }

    return result.data;
}

async function getGuards() {
    return apiRequest("/guards");
}

async function getClients() {
    return apiRequest("/clients");
}

async function getSites() {
    return apiRequest("/sites");
}