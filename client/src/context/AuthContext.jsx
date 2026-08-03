import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "life-partner-session";
const API_BASE = `${import.meta.env.VITE_API_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // Check if profile is complete
      let profileComplete = false;
      try {
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${data.id}`);
        if (profileRes.ok) {
          profileComplete = true;
        }
      } catch (e) {
        // ignore error
      }

      const userData = { ...data, profileComplete };
      persistUser(userData);
      return { data: { user: userData }, error: null };
    } catch {
      return { data: null, error: { message: "Unable to connect to the server." } };
    }
  };

  const completeProfile = (profileFlags = {}) => {
    const nextUser = {
      ...(user ?? {}),
      ...profileFlags,
      profileComplete: true,
    };
    persistUser(nextUser);
    return nextUser;
  };

  const signOut = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve({ error: null });
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, completeProfile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
