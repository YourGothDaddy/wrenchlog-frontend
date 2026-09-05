export const BASE_URL = import.meta.env.VITE_API_URL;

let refreshPromise = null;

async function tryRefresh() {
    if (!refreshPromise) {
        refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        }).finally(() => {
            refreshPromise = null;
        });
    }
    const response = await refreshPromise;
    return response.ok;
}

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = { ...options.headers };

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
        credentials: 'include',
    };

    let response = await fetch(url, config);

    const isAuthEndpoint = endpoint.startsWith('/api/auth/');

    if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
        const refreshed = await tryRefresh();

        if (refreshed) {
            response = await fetch(url, config);
        }

        if (!refreshed || response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            return Promise.reject('Session expired. Please log in again.');
        }
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
    patch: (endpoint, data, options) => request(endpoint, {
        ...options,
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;