import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdLock } from "react-icons/md";
import BrandMark from "../components/BrandMark";
import { useAdminAuth } from "./context/AdminAuthContext";
import "./admin.css";

export default function AdminLoginPage() {
  const { adminSignIn } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await adminSignIn(username, password);
    setLoading(false);
    if (authError) return setError(authError.message);
    navigate("/admin");
  };

  return (
    <div className="crm-app">
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--page-bg)" }}>
        <div style={{ width: "100%", maxWidth: 380, background: "var(--white)", borderRadius: "var(--radius-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)", padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <BrandMark compact />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-heading)", textAlign: "center", marginBottom: 4 }}>Admin Sign In</h1>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>Restricted to platform administrators.</p>

          {error && <div className="form-error" style={{ marginBottom: 14, textAlign: "center" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              <MdLock /> {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
