import { useState } from "react";
import { MdSend } from "react-icons/md";
import Modal from "../components/ui/Modal";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;

const AUDIENCES = [
  { value: "all", label: "All Active Users" },
  { value: "premium", label: "Premium Users" },
  { value: "free", label: "Free Users" },
  { value: "inactive", label: "Inactive (Deactivated) Users" },
];

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: "", message: "", audience: "all" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.message.trim()) errs.message = "Message is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSending(true);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/notifications/broadcast`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send.");
      setResult(data);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h2>Send Notification</h2><p>Broadcasts a real notification to every currently-matching user — they'll see it in their real notification bell.</p></div>
      </div>

      <div className="table-card" style={{ maxWidth: 560, padding: 24 }}>
        <form onSubmit={handleSubmit}>
          {errors.submit && <div className="form-error" style={{ marginBottom: 12 }}>{errors.submit}</div>}
          <div className="form-group">
            <label className="form-label">Notification Title *</label>
            <input className={`form-input${errors.title ? " error" : ""}`} placeholder="e.g. New Feature Available"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={100} />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea className={`form-textarea${errors.message ? " error" : ""}`} placeholder="Write your notification message..."
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} maxLength={500} />
            {errors.message && <div className="form-error">{errors.message}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Audience</label>
            <select className="form-select" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
              {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={sending} style={{ width: "100%", justifyContent: "center" }}>
            <MdSend /> {sending ? "Sending…" : "Send Notification"}
          </button>
        </form>
      </div>

      {result && (
        <Modal title="Notification Sent" onClose={() => setResult(null)} footer={<button className="btn btn-primary" onClick={() => setResult(null)}>Done</button>}>
          <div className="success-state">
            <div className="success-icon" style={{ background: "#faf0dc", color: "#c9a84c" }}>🔔</div>
            <h3>Sent!</h3>
            <p>"{form.title}" was delivered to <strong>{result.sentCount}</strong> real user{result.sentCount !== 1 ? "s" : ""}.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
