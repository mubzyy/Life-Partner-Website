import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Google's Identity Services script is shared across every mount of this
// component (e.g. if it ever appears on both Register and Login) — loaded
// once, cached, reused.
let scriptPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => { scriptPromise = null; reject(new Error("script load failed")); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// The real "Sign in with Google" button. Google renders this itself (it's an
// iframe, not something we can restyle) — we only control its size/shape/
// theme via the options below, and keep it in the exact spot the old
// decorative button used to sit in.
const GoogleSignInButton = ({ text = "signup_with", onError }) => {
  const containerRef = useRef(null);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            const { error } = await signInWithGoogle(response.credential);
            if (error) {
              onError?.(error.message);
            } else {
              navigate("/dashboard");
            }
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text,
          logo_alignment: "center",
          width: Math.min(containerRef.current.offsetWidth || 260, 400),
        });
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) {
    // Not configured yet (GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID unset) —
    // an honest disabled state instead of a button that silently does nothing.
    return (
      <button
        type="button" disabled title="Google sign-in isn't configured yet"
        className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border-light text-[14px] font-bold text-text-muted opacity-60 cursor-not-allowed"
      >
        <GoogleLogo />
        <span className="hidden sm:inline">Google</span>
      </button>
    );
  }

  if (failed) {
    return (
      <button
        type="button" disabled title="Couldn't load Google Sign-In"
        className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border-light text-[14px] font-bold text-text-muted opacity-60 cursor-not-allowed"
      >
        <GoogleLogo />
        <span className="hidden sm:inline">Google unavailable</span>
      </button>
    );
  }

  // Google's own button renders inside this div once the script loads.
  return <div ref={containerRef} className="w-full flex justify-center" />;
};

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default GoogleSignInButton;
