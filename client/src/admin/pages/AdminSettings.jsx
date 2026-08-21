import { useState, useEffect } from "react";
import { MdSecurity, MdStorage } from "react-icons/md";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;

function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-switch" htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function SettingRow({ title, description, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info"><h4>{title}</h4>{description && <p>{description}</p>}</div>
      {children}
    </div>
  );
}

function SecuritySection() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.newPass.length < 6) return setError("New password must be at least 6 characters.");
    if (form.newPass !== form.confirm) return setError("Passwords do not match.");
    setSaving(true);
    try {
      const res = await adminFetch(`${API_URL}/api/admin-auth/change-password`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");
      setForm({ current: "", newPass: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="settings-section-header"><h3>Security</h3><p>Change your admin account password.</p></div>
      <div className="settings-section-body">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        {saved && <div style={{ color: "var(--positive)", fontSize: 13, marginBottom: 12 }}>Password changed. You'll need to log in again next time.</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">New Password</label>
              <input className="form-input" type="password" value={form.newPass} onChange={e => setForm({ ...form, newPass: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Change Password"}</button>
        </form>
      </div>
    </div>
  );
}

function PlatformSection() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/settings/platform`).then(res => res.json()).then(setSettings).catch(console.error);
  }, []);

  async function update(patch) {
    setSaving(true);
    setError("");
    try {
      const res = await adminFetch(`${API_URL}/api/admin/settings/platform`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (data.errors || []).join(" ") || "Failed to save.");
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <div className="empty-state"><p>Loading…</p></div>;

  return (
    <div>
      <div className="settings-section-header"><h3>Platform Settings</h3><p>Every value here is real and enforced across the app — not just displayed.</p></div>
      <div className="settings-section-body">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        {saved && <div style={{ color: "var(--positive)", fontSize: 13, marginBottom: 12 }}>Saved.</div>}

        <SettingRow title="Maintenance Mode" description="When on, only admin accounts can log in. Real users see a maintenance message.">
          <Toggle id="maintenance" checked={settings.maintenance_mode} onChange={v => update({ maintenance_mode: v })} />
        </SettingRow>
        <SettingRow title="Registration Open" description="When off, new signups (send-verification) are rejected immediately.">
          <Toggle id="regopen" checked={settings.registration_open} onChange={v => update({ registration_open: v })} />
        </SettingRow>
        <SettingRow title="Auto-Approve Verifications" description="New CNIC/Selfie/Profile Photo requests are approved instantly instead of entering the review queue.">
          <Toggle id="autoapprove" checked={settings.auto_approve_verifications} onChange={v => update({ auto_approve_verifications: v })} />
        </SettingRow>
        <SettingRow title="Premium Required to Message" description="Non-premium users can't start a NEW conversation (existing conversations are never affected).">
          <Toggle id="premiummsg" checked={settings.premium_required_to_message} onChange={v => update({ premium_required_to_message: v })} />
        </SettingRow>
        <SettingRow title="Minimum Age" description="Enforced on Complete Profile's date-of-birth field.">
          <input className="form-input" type="number" min={18} max={99} style={{ width: 90 }}
            defaultValue={settings.min_age} onBlur={e => e.target.value !== String(settings.min_age) && update({ min_age: Number(e.target.value) })} />
        </SettingRow>
        <SettingRow title="Max Photos Per User" description="Enforced on profile photo uploads.">
          <input className="form-input" type="number" min={1} max={20} style={{ width: 90 }}
            defaultValue={settings.max_photos} onBlur={e => e.target.value !== String(settings.max_photos) && update({ max_photos: Number(e.target.value) })} />
        </SettingRow>

        {saving && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>Saving…</p>}
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "security", label: "Security", icon: <MdSecurity /> },
  { id: "platform", label: "Platform", icon: <MdStorage /> },
];

export default function AdminSettings() {
  const [active, setActive] = useState("security");

  return (
    <div className="settings-grid">
      <div className="settings-sidebar-card">
        {SECTIONS.map(s => (
          <div key={s.id} className={`settings-nav-item${active === s.id ? " active" : ""}`} onClick={() => setActive(s.id)}>
            <span className="settings-nav-icon">{s.icon}</span>{s.label}
          </div>
        ))}
      </div>
      <div className="settings-content-card">
        {active === "security" && <SecuritySection />}
        {active === "platform" && <PlatformSection />}
      </div>
    </div>
  );
}
