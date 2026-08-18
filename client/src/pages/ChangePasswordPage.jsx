import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Key, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../lib/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputCls = "w-full box-border px-4 py-3 pr-10 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[14px] text-slate-800 outline-none transition-all focus:border-[#E91E63] focus:bg-white focus:ring-1 focus:ring-[#E91E63]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Changing the password invalidates every session (including this one —
  // see server/middleware/auth.js), so the only honest next step is to sign
  // the user out for real and send them back to log in with the new password.
  const handleDone = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc]">
      <div className="w-full max-w-[560px] mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-800 m-0 leading-tight">Change Password</h1>
            <p className="text-[13px] text-slate-500 m-0">Update your account password.</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 md:p-8">
          {success ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800 mb-2">Password Changed</h3>
              <p className="text-[13px] text-slate-500 mb-6">Your password was updated. For your security, you've been signed out everywhere — please log in again with your new password.</p>
              <button onClick={handleDone} className="py-2.5 px-6 rounded-full font-bold text-[13px] text-white bg-[#E91E63] hover:bg-pink-600 transition-colors">
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-600">{error}</div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    maxLength={72}
                    className={inputCls}
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E91E63] bg-transparent border-none cursor-pointer p-1">
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    maxLength={72}
                    className={inputCls}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E91E63] bg-transparent border-none cursor-pointer p-1">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="mt-1 text-[12px] text-amber-600">At least 6 characters</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  maxLength={72}
                  className="w-full box-border px-4 py-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[14px] text-slate-800 outline-none transition-all focus:border-[#E91E63] focus:bg-white focus:ring-1 focus:ring-[#E91E63]"
                />
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-[12px] ${confirmPassword === newPassword ? "text-green-600" : "text-red-500"}`}>
                    {confirmPassword === newPassword ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-3.5 rounded-xl text-white font-bold text-[14px] bg-[#E91E63] hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Key size={16} />
                {saving ? "Updating…" : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
