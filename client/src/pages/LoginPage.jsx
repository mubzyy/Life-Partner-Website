import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/BrandMark";

// ─── Forgot Password Modal ────────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP + new pass, 3 = success
  const [fpEmail, setFpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!fpEmail) return setError("Please enter your email address.");
    setLoading(true); setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to send code."); setLoading(false); return; }
      setStep(2);
      startCooldown();
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true); setError("");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      startCooldown();
    } catch { setError("Failed to resend. Please try again."); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) return setError("Please enter the full 6-digit code.");
    if (!newPassword) return setError("Please enter a new password.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true); setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Reset failed."); setLoading(false); return; }
      setStep(3);
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  };

  const inputCls = "w-full box-border px-4 py-3 rounded-xl border-[1.5px] border-border-light bg-background text-[14px] text-text-primary outline-none transition-all hover:border-slate-300 focus:border-primary focus:bg-card focus:shadow-sm";
  const labelCls = "block text-[13px] font-bold text-text-primary mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-card rounded-[28px] p-8 max-w-md w-full shadow-2xl">

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-very-light text-primary rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-[22px] font-bold text-text-primary mb-2">Password Reset!</h3>
            <p className="text-[14px] text-text-secondary mb-6">Your password has been updated successfully. You can now sign in with your new password.</p>
            <button onClick={onClose} className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] bg-primary hover:bg-primary-hover transition-all shadow-sm cursor-pointer">
              Back to Sign In
            </button>
          </div>
        )}

        {/* Step 1 — Enter Email */}
        {step === 1 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold text-text-primary">Forgot Password?</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text-secondary text-[20px] leading-none cursor-pointer bg-transparent border-none">×</button>
            </div>
            <p className="text-[14px] text-text-secondary mb-6 leading-relaxed">
              Enter the email address associated with your account and we'll send you a reset code.
            </p>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-[13px] text-red-600">{error}</div>}
            <div className="mb-5">
              <label className={labelCls}>Email Address</label>
              <input
                type="email" value={fpEmail}
                onChange={e => setFpEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendCode()}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <button onClick={handleSendCode} disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] transition-all ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer'}`}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {/* Step 2 — Enter OTP + New Password */}
        {step === 2 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[20px] font-bold text-text-primary">Reset Password</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text-secondary text-[20px] leading-none cursor-pointer bg-transparent border-none">×</button>
            </div>
            <p className="text-[13px] text-text-secondary mb-5">
              Enter the 6-digit code sent to <span className="font-bold text-primary">{fpEmail}</span> along with your new password.
            </p>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-[13px] text-red-600">{error}</div>}

            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Verification Code</label>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-[26px] font-bold tracking-[10px] py-3.5 px-4 rounded-xl border-[2px] border-border-light bg-background text-text-primary outline-none transition-all focus:border-primary focus:bg-card focus:shadow-sm"
                />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowNewPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors p-1 cursor-pointer">
                    {showNewPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input
                  type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            </div>

            <button onClick={handleResetPassword} disabled={loading}
              className={`w-full mt-5 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all mb-3 ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer'}`}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="flex items-center justify-center gap-1 text-[13px] text-text-secondary">
              <span>Didn't get the code?</span>
              {resendCooldown > 0 ? (
                <span className="text-text-muted">Resend in {resendCooldown}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading}
                  className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none">
                  Resend
                </button>
              )}
            </div>
            <button type="button" onClick={() => { setStep(1); setError(""); }}
              className="w-full mt-2 text-[12px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-none">
              ← Change email address
            </button>
          </>
        )}

      </div>
    </div>
  );
};


// ─── Login Page ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-background">

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}

      {/* Header */}
      <div className="hidden md:block absolute top-0 left-0 px-6 py-4 md:px-8 md:py-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90">
          <BrandMark />
        </Link>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-[32px] md:text-[36px] font-bold text-text-primary font-bold m-0 mb-2">
              Welcome Back
            </h1>
            <p className="text-[14px] md:text-[15px] text-text-secondary m-0">Sign in to your Life Partner account</p>
          </div>

          <div className="bg-card rounded-[24px] border-[1.5px] border-border-light p-6 sm:p-8 shadow-sm">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-5 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
              <div>
                <label className="block text-[13px] font-bold text-text-primary mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full box-border px-4 py-3 rounded-xl border-[1.5px] border-border-light bg-background text-[14px] text-text-primary outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary focus:bg-card focus:shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-bold text-text-primary">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[12.5px] font-semibold text-primary hover:text-primary-hover hover:underline transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full box-border px-4 py-3 pr-10 rounded-xl border-[1.5px] border-border-light bg-background text-[14px] text-text-primary outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary focus:bg-card focus:shadow-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted hover:text-primary transition-colors flex p-1">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-[15px] transition-all duration-300 
                  ${loading 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-primary hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-sm cursor-pointer'
                  }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-[13px] text-text-secondary mt-5 mb-0">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-bold no-underline hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
