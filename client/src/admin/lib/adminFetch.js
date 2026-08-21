/**
 * adminFetch — the admin-CRM equivalent of ../../lib/authFetch.js, kept
 * completely separate on purpose: it reads from its OWN localStorage key
 * (never the customer session key), so an admin session and a customer
 * session can coexist in the same browser without either ever leaking into
 * the other's requests.
 */

const ADMIN_STORAGE_KEY = "life-partner-admin-session";

export function getAdminToken() {
    try {
        const session = JSON.parse(window.localStorage.getItem(ADMIN_STORAGE_KEY));
        return session?.token ?? null;
    } catch {
        return null;
    }
}

export function getAdminSession() {
    try {
        return JSON.parse(window.localStorage.getItem(ADMIN_STORAGE_KEY));
    } catch {
        return null;
    }
}

export function setAdminSession(session) {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function adminFetch(url, options = {}) {
    const token = getAdminToken();
    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, { ...options, headers });
}
