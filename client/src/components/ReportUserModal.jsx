import { useState } from "react";
import { Flag, X, AlertCircle } from "lucide-react";
import { authFetch } from "../lib/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

// Must match server/lib/reports.js VALID_REASONS exactly.
const REASONS = ["Fake Profile", "Inappropriate Content", "Harassment", "Spam", "Scam / Fraud", "Other"];

// Shared report-a-user modal — used from Profile View and Messages. Visual
// style matches the existing ConfirmModal pattern (SettingsPage.jsx): dark
// backdrop, white rounded card, no new design language introduced.
const ReportUserModal = ({ isOpen, onClose, reportedId, reportedName, onSubmitted }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    if (submitting) return;
    setReason(""); setDetails(""); setError(""); setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { setError("Please choose a reason."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await authFetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reported_id: reportedId, reason, details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit report.");
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={close}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl animate-scale-up" onClick={e => e.stopPropagation()}>
        {success ? (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 bg-green-100 text-green-500">
              <Flag size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Report Submitted</h3>
            <p className="text-[14px] text-slate-500 mb-6">Thanks — our team will review this report.</p>
            <button onClick={close} className="w-full py-2.5 rounded-[12px] font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <Flag size={17} />
                </div>
                <h3 className="text-[16px] font-bold text-slate-800 m-0">Report {reportedName || "User"}</h3>
              </div>
              <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1">
                <X size={16} />
              </button>
            </div>
            <p className="text-[13px] text-slate-500 mb-4">Tell us what's wrong. Your report is confidential.</p>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-600 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Reason</label>
            <select
              required value={reason} onChange={e => setReason(e.target.value)}
              className="w-full p-3 mb-3 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
            >
              <option value="">Select a reason...</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Details (optional)</label>
            <textarea
              rows={3} value={details} onChange={e => setDetails(e.target.value)}
              placeholder="Add any extra context..."
              className="w-full p-3 mb-4 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] resize-none"
            />

            <div className="flex gap-3">
              <button type="button" onClick={close} className="flex-1 py-2.5 rounded-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="flex-1 py-2.5 rounded-[12px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportUserModal;
