/**
 * authFetch — wrapper around fetch that automatically attaches the JWT
 * from localStorage as an Authorization: Bearer header.
 *
 * Usage: authFetch(`${API_URL}/api/favorites`, { method: "GET" })
 */

const STORAGE_KEY = "life-partner-session";

export function getToken() {
    try {
        const session = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
        return session?.token ?? null;
    } catch {
        return null;
    }
}

export function authFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, { ...options, headers });
}
