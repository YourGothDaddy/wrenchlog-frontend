const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const storedUser = localStorage.getItem('wrenchlog_user');
    const token = storedUser ? JSON.parse(storedUser).token : null;

    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    const isAuthEndpoint = endpoint.startsWith('/api/auth/');

    if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
        localStorage.removeItem('wrenchlog_user');
        window.location.href = '/login';
        return Promise.reject('Session expired. Please log in again.');
    }

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Database request failed.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

const api = {
    get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),

    post: (endpoint, data, options) => request(endpoint, {
        ...options,
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),

    put: (endpoint, data, options) => request(endpoint, {
        ...options,
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),

    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;