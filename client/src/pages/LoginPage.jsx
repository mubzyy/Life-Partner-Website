import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) return setError(authError.message);
    navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f7f5 0%, #f7f4ee 50%, #eef5f2 100%)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src={logo} alt="Life Partner" style={{ height: 52, width: 52, objectFit: "contain" }} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#0f5d52" }}>Life Partner</div>
            <div style={{ fontSize: 10, color: "#7a9490" }}>Find your partner for life</div>
          </div>
        </Link>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: "#1a2e2b", margin: "0 0 8px" }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: 15, color: "#6b8a86", margin: 0 }}>Sign in to your Life Partner account</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 24, border: "1.5px solid #e8ebe9", padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>


            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="imtiaz@lifepartner.com"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 16px", borderRadius: 12,
                    border: "1.5px solid #e2e8f0", background: "#f8fafc",
                    fontSize: 14, color: "#1e293b", outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#0f5d52"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "12px 44px 12px 16px", borderRadius: 12,
                      border: "1.5px solid #e2e8f0", background: "#f8fafc",
                      fontSize: 14, color: "#1e293b", outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0f5d52"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 6px 20px rgba(15,93,82,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20, marginBottom: 0 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#0f5d52", fontWeight: 700, textDecoration: "none" }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
