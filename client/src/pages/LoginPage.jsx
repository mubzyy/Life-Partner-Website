import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";

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
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
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
      await fetch("http://localhost:5000/api/auth/forgot-password", {
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
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
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

  const inputCls = "w-full box-border px-4 py-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[14px] text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-[#0f5d52] focus:bg-white focus:shadow-[0_0_0_2px_rgba(15,93,82,0.1)]";
  const labelCls = "block text-[13px] font-bold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] p-8 max-w-md w-full shadow-2xl">

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#edf7f5] text-[#0f5d52] rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-[22px] font-bold text-[#1a2e2b] mb-2">Password Reset!</h3>
            <p className="text-[14px] text-slate-500 mb-6">Your password has been updated successfully. You can now sign in with your new password.</p>
            <button onClick={onClose} className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] bg-[#0f5d52] hover:bg-[#0d4d44] transition-all shadow-[0_6px_20px_rgba(15,93,82,0.25)] cursor-pointer">
              Back to Sign In
            </button>
          </div>
        )}

        {/* Step 1 — Enter Email */}
        {step === 1 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-bold text-[#1a2e2b]">Forgot Password?</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-[20px] leading-none cursor-pointer bg-transparent border-none">×</button>
            </div>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
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
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] transition-all ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#0f5d52] hover:bg-[#0d4d44] shadow-[0_6px_20px_rgba(15,93,82,0.25)] cursor-pointer'}`}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {/* Step 2 — Enter OTP + New Password */}
        {step === 2 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[20px] font-bold text-[#1a2e2b]">Reset Password</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-[20px] leading-none cursor-pointer bg-transparent border-none">×</button>
            </div>
            <p className="text-[13px] text-slate-500 mb-5">
              Enter the 6-digit code sent to <span className="font-bold text-[#0f5d52]">{fpEmail}</span> along with your new password.
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
                  className="w-full text-center text-[26px] font-bold tracking-[10px] py-3.5 px-4 rounded-xl border-[2px] border-slate-200 bg-slate-50 text-[#1a2e2b] outline-none transition-all focus:border-[#0f5d52] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,93,82,0.1)]"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0f5d52] transition-colors p-1 cursor-pointer">
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
              className={`w-full mt-5 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all mb-3 ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#0f5d52] hover:bg-[#0d4d44] shadow-[0_6px_20px_rgba(15,93,82,0.25)] cursor-pointer'}`}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="flex items-center justify-center gap-1 text-[13px] text-slate-500">
              <span>Didn't get the code?</span>
              {resendCooldown > 0 ? (
                <span className="text-slate-400">Resend in {resendCooldown}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading}
                  className="text-[#0f5d52] font-bold hover:underline cursor-pointer bg-transparent border-none">
                  Resend
                </button>
              )}
            </div>
            <button type="button" onClick={() => { setStep(1); setError(""); }}
              className="w-full mt-2 text-[12px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none">
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
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: "linear-gradient(135deg, #f0f7f5 0%, #f7f4ee 50%, #eef5f2 100%)" }}>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}

      {/* Header */}
      <div className="px-6 py-4 md:px-8 md:py-6">
        <Link to="/" className="inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90">
          <img src={logo} alt="Life Partner" className="h-[48px] w-[48px] md:h-[52px] md:w-[52px] object-contain drop-shadow-sm" />
          <div className="flex flex-col justify-center">
            <div style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[20px] md:text-[22px] leading-none font-bold text-[#0f5d52] tracking-wide mb-1">Life Partner</div>
            <div className="text-[10px] md:text-[11px] leading-none font-medium text-[#7a9490] tracking-wide">Find your partner for life</div>
          </div>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[32px] md:text-[36px] font-bold text-[#1a2e2b] m-0 mb-2">
              Welcome Back
            </h1>
            <p className="text-[14px] md:text-[15px] text-[#6b8a86] m-0">Sign in to your Life Partner account</p>
          </div>

          <div className="bg-white rounded-[24px] border-[1.5px] border-[#e8ebe9] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-5 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="imtiaz@lifepartner.com"
                  className="w-full box-border px-4 py-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[14px] text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-[#0f5d52] focus:bg-white focus:shadow-[0_0_0_2px_rgba(15,93,82,0.1)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[12.5px] font-semibold text-[#0f5d52] hover:text-[#0d4d44] hover:underline transition-colors cursor-pointer bg-transparent border-none"
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
                    className="w-full box-border px-4 py-3 pr-10 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[14px] text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-[#0f5d52] focus:bg-white focus:shadow-[0_0_0_2px_rgba(15,93,82,0.1)]"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-[#0f5d52] transition-colors flex p-1">
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
                    : 'bg-gradient-to-br from-[#0f5d52] to-[#1a7a6e] hover:from-[#0d4d44] hover:to-[#156359] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_6px_20px_rgba(15,93,82,0.3)] hover:shadow-[0_10px_24px_rgba(15,93,82,0.4)] cursor-pointer'
                  }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-[13px] text-slate-500 mt-5 mb-0">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#0f5d52] font-bold no-underline hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
