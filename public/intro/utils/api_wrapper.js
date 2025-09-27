const BACKEND_URL = "https://bytehubserver.onrender.com";

export async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        window.location.href = "../login/login"; 
        throw new Error("No access token found. Redirecting to login.");
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
    };

    let response = await fetch(`${BACKEND_URL}${url}`, {
        ...options,
        headers: headers,
        credentials: 'include', 
    });

    if (response.status === 403 || response.status === 401) {
        console.log("Access Token expired. Attempting refresh");
        
        const refreshResponse = await fetch(`${BACKEND_URL}/token`, {
            method: 'POST',
            credentials: 'include', 
        });

        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.accessToken;
            
            localStorage.setItem("accessToken", newAccessToken);
            
            const newHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${newAccessToken}`,
            };

            console.log("Token refreshed. Retrying original request");
            
            response = await fetch(`${BACKEND_URL}${url}`, {
                ...options,
                headers: newHeaders,
                credentials: 'include',
            });

        } else {
            console.error("Token refresh failed. Forcing logout.");
            localStorage.clear(); 
            window.location.replace('../index?session_expired=true'); 
            throw new Error("Session expired. Please log in again.");
        }
    }
    
    return response;
}