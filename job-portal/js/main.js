const API_BASE = 'api/';

// Helper to interact with APIs
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {}
    };

    // ✅ Handle GET params properly
    let url = `${API_BASE}${endpoint}`;
    if (method === 'GET' && data) {
        const query = new URLSearchParams(data).toString();
        url += `?${query}`;
    }

    // ✅ Handle POST/PUT for PHP
    if (data && (method === 'POST' || method === 'PUT')) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = new URLSearchParams(data).toString();
    }

    try {
        const response = await fetch(url, options);

        // ✅ Handle 405 & other errors clearly
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status} - ${text}`);
        }

        // ✅ Safe JSON parsing (prevents crash)
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return { raw: text }; // fallback if not JSON
        }

    } catch (error) {
        console.error("API Call Error:", error);
        return { error: error.message };
    }
}