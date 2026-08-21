import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { getAdminSession, setAdminSession, clearAdminSession } from "../lib/adminFetch";

const AdminAuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

// Completely separate from the customer AuthContext — different storage
// key, different login endpoint, different token. An admin session and a
// customer session are two unrelated things that happen to share a browser.
export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setAdmin(getAdminSession());
        setLoading(false);
    }, []);

    const adminSignIn = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/api/admin-auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) return { error: { message: data.message || "Login failed." } };
            setAdminSession(data);
            setAdmin(data);
            return { data, error: null };
        } catch {
            return { error: { message: "Unable to connect to the server." } };
        }
    };

    const adminSignOut = () => {
        clearAdminSession();
        setAdmin(null);
    };

    const value = useMemo(() => ({ admin, loading, adminSignIn, adminSignOut }), [admin, loading]);

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => useContext(AdminAuthContext);
