import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MdSearch, MdAdd, MdEdit, MdVisibility, MdBlock, MdCheckCircle } from "react-icons/md";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const PER_PAGE = 10;

function AddUserModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone_code: "+92", phone_number: "", city: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/users`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user.");
      onAdded();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (success) return (
    <Modal title="Add New User" onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
      <div className="success-state"><div className="success-icon">✓</div><h3>User Added!</h3><p>{form.first_name} has been added to the platform.</p></div>
    </Modal>
  );

  return (
    <Modal title="Add New User" onClose={onClose} footer={
      <>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Adding…" : "Add User"}</button>
      </>
    }>
      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">First Name *</label>
            <input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Last Name *</label>
            <input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Email *</label>
          <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Phone</label>
            <input className="form-input" placeholder="+92 3XXXXXXXXX" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">City</label>
            <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>A real account is created immediately (no email verification step) — the user can set a password anytime via "Forgot password".</p>
      </form>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: user.name.split(" ")[0] || "", last_name: user.name.split(" ").slice(1).join(" ") || "",
    email: user.email, city: user.city === "Not specified" ? "" : user.city.split(",")[0], plan: user.plan,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user.");
      onSaved();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (success) return (
    <Modal title="Edit User" onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
      <div className="success-state"><div className="success-icon">✓</div><h3>User Updated!</h3></div>
    </Modal>
  );

  return (
    <Modal title={`Edit User — ${user.name}`} onClose={onClose} footer={
      <>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
      </>
    }>
      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSave}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">First Name</label>
            <input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Last Name</label>
            <input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Email</label>
          <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">City</label>
            <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Plan</label>
            <select className="form-select" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
              <option>Free</option>
              <option>1 Month Plan</option>
              <option>3 Months Plan</option>
              <option>6 Months Plan</option>
              <option>12 Months Plan</option>
            </select>
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Changing the plan here really assigns/cancels a subscription — it isn't just a label.</p>
      </form>
    </Modal>
  );
}

function ViewUserModal({ user, onClose }) {
  return (
    <Modal title="User Details" onClose={onClose} footer={<button className="btn btn-outline" onClick={onClose}>Close</button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 0 16px", borderBottom: "1px solid var(--border-light)" }}>
          <Avatar initials={user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#c9a84c" size="xl" img={user.image ? `${API_URL}${user.image}` : null} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-heading)" }}>{user.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{user.email}</div>
            <div style={{ marginTop: 6 }}><Badge status={user.status} /></div>
          </div>
        </div>
        {[["Phone", user.phone], ["City", user.city], ["Plan", user.plan], ["Verified", user.verified ? "Yes" : "No"], ["Joined", new Date(user.joined).toLocaleDateString()]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{k}</span>
            <span style={{ color: "var(--text-heading)", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(searchParams.get("action") === "add" ? { type: "add" } : null);

  // Deep-link support for the dashboard's "Add User" quick action
  // (?action=add) — open the modal once, then clean the URL.
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      const next = new URLSearchParams(searchParams);
      next.delete("action");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (search) params.set("search", search);
    if (statusFilter !== "All") params.set("status", statusFilter);
    if (planFilter !== "All") params.set("plan", planFilter);
    adminFetch(`${API_URL}/api/admin/users?${params}`)
      .then(res => res.json())
      .then(data => { setUsers(data.results || []); setTotal(data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, planFilter]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(user) {
    const deactivating = user.status === "Active";
    if (deactivating && !window.confirm(`Deactivate ${user.name}? They'll be signed out and unable to log in until reactivated.`)) return;
    const action = deactivating ? "deactivate" : "activate";
    await adminFetch(`${API_URL}/api/admin/users/${user.id}/${action}`, { method: "POST" });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h2>All Users</h2><p>Total {total.toLocaleString()} registered users</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}><MdAdd /> Add New User</button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <span className="search-icon"><MdSearch /></span>
            <input type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
          <select className="filter-select" value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Free</option><option>1 Month Plan</option><option>3 Months Plan</option><option>6 Months Plan</option><option>12 Months Plan</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>User</th><th>Phone</th><th>City</th><th>Plan</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3></div></td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{(page - 1) * PER_PAGE + i + 1}</td>
                  <td>
                    <div className="user-cell">
                      <Avatar initials={u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#2d8a4e" size="sm" img={u.image ? `${API_URL}${u.image}` : null} />
                      <div className="user-cell-info"><h4>{u.name}</h4><span>{u.email}</span></div>
                    </div>
                  </td>
                  <td>{u.phone}</td>
                  <td>{u.city}</td>
                  <td style={{ fontSize: 12.5, fontWeight: 500 }}>{u.plan}</td>
                  <td><Badge status={u.verified ? "Verified" : "Unverified"} /></td>
                  <td><Badge status={u.status} /></td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(u.joined).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-outline btn-icon" title="View" onClick={() => setModal({ type: "view", user: u })}><MdVisibility /></button>
                      <button className="btn btn-sm btn-outline btn-icon" title="Edit" onClick={() => setModal({ type: "edit", user: u })}><MdEdit /></button>
                      <button className="btn btn-sm btn-outline btn-icon" title={u.status === "Active" ? "Deactivate" : "Activate"}
                        style={{ color: u.status === "Active" ? "var(--negative)" : "var(--positive)" }}
                        onClick={() => toggleActive(u)}>
                        {u.status === "Active" ? <MdBlock /> : <MdCheckCircle />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination total={total} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>

      {modal?.type === "add" && <AddUserModal onClose={() => setModal(null)} onAdded={load} />}
      {modal?.type === "view" && <ViewUserModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <EditUserModal user={modal.user} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  );
}
