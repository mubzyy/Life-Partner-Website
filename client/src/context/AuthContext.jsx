import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authFetch } from "../lib/authFetch";

const AuthContext = createContext(null);

const STORAGE_KEY = "life-partner-session";
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The authenticated user's real profile, loaded from PostgreSQL via
  // GET /api/profile/me. This is the single source of truth for profile
  // fields, completion %, and onboarding progress — every screen that needs
  // any of that (Complete Profile wizard, My Profile, Dashboard widget,
  // navbar avatar) reads it from here instead of keeping its own copy.
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const storedSession = window.localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/profile/me`);
      if (!res.ok) {
        setProfile(null);
        return null;
      }
      const data = await res.json();
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Whenever we gain (or lose) an authenticated user, keep `profile` in sync
  // — covers both fresh logins and session rehydration on page reload.
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Real sign-in: POST /api/auth/login
  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: data.message || "Login failed." } };
      }

      const userData = { ...data };
      persistUser(userData);
      return { data: { user: userData }, error: null };
    } catch {
      return { data: null, error: { message: "Unable to connect to the server." } };
    }
  };

  // Real "Sign in with Google": POST /api/auth/google with the ID token
  // Google's own button hands back. Same response shape as signIn, so it
  // persists exactly the same way.
  const signInWithGoogle = async (credential) => {
    try {
      const response = await fetch(`${API_BASE}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: data.message || "Google sign-in failed." } };
      }

      const userData = { ...data };
      persistUser(userData);
      return { data: { user: userData }, error: null };
    } catch {
      return { data: null, error: { message: "Unable to connect to the server." } };
    }
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    window.localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve({ error: null });
  };

  const value = useMemo(
    () => ({ user, loading, profile, profileLoading, signIn, signInWithGoogle, signOut, refreshProfile }),
    [user, loading, profile, profileLoading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
