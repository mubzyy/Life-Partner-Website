import { useState, useEffect, useCallback } from "react";
import { MdAdd, MdEdit } from "react-icons/md";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const PER_PAGE = 10;
const ACCENTS = ["#2d5e40", "#c9a84c", "#a8bfb0", "#f0c040", "#3a6abf", "#e05c5c"];

function PlanModal({ plan, onClose, onSaved }) {
  const isEdit = !!plan;
  const [form, setForm] = useState({
    name: plan?.name || "", price: plan?.price || "", duration_months: plan?.durationMonths || 1,
    features: plan?.features?.join("\n") || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.price || Number(form.price) <= 0) {
      setError("A valid plan name and price are required.");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `${API_URL}/api/admin/subscriptions/plans/${plan.id}` : `${API_URL}/api/admin/subscriptions/plans`;
      const res = await adminFetch(url, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, price: form.price, duration_months: form.duration_months, features: form.features }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save plan.");
      onSaved();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (success) return (
    <Modal title={isEdit ? "Edit Plan" : "Add Subscription Plan"} onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
      <div className="success-state"><div className="success-icon" style={{ background: "#faf0dc", color: "#c9a84c" }}>👑</div><h3>{isEdit ? "Plan Updated!" : "Plan Created!"}</h3></div>
    </Modal>
  );

  return (
    <Modal title={isEdit ? `Edit Plan — ${plan.name}` : "Add Subscription Plan"} onClose={onClose} footer={
      <>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Plan"}</button>
      </>
    }>
      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Plan Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Price (PKR) *</label>
            <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
        </div>
        {!isEdit && (
          <div className="form-group"><label className="form-label">Duration (months)</label>
            <select className="form-select" value={form.duration_months} onChange={e => setForm({ ...form, duration_months: Number(e.target.value) })}>
              <option value={1}>1 Month</option><option value={3}>3 Months</option><option value={6}>6 Months</option><option value={12}>12 Months</option>
            </select>
          </div>
        )}
        <div className="form-group"><label className="form-label">Features (one per line)</label>
          <textarea className="form-textarea" placeholder="e.g. Unlimited matches&#10;Profile boost&#10;Priority support" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={4} />
        </div>
      </form>
    </Modal>
  );
}

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [subs, setSubs] = useState({ results: [], total: 0 });
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const loadPlans = useCallback(() => {
    adminFetch(`${API_URL}/api/admin/subscriptions/plans`).then(res => res.json()).then(setPlans).catch(console.error);
  }, []);

  const loadSubs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (statusFilter !== "All") params.set("status", statusFilter);
    adminFetch(`${API_URL}/api/admin/subscriptions?${params}`).then(res => res.json()).then(setSubs).catch(console.error).finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { loadPlans(); }, [loadPlans]);
  useEffect(() => { loadSubs(); }, [loadSubs]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h2>Subscription Plans</h2><p>Real plans, subscribers, and revenue</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}><MdAdd /> Add Plan</button>
      </div>

      <div className="plan-cards-row">
        {plans.map((p, i) => (
          <div key={p.id} className="plan-card">
            <div className="plan-card-accent" style={{ background: ACCENTS[i % ACCENTS.length] }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="plan-card-title">{p.name}{!p.isActive && <span style={{ marginLeft: 6 }}><Badge status="Inactive" /></span>}</div>
              <button className="btn btn-sm btn-outline btn-icon" title="Edit" onClick={() => setModal({ type: "edit", plan: p })}><MdEdit /></button>
            </div>
            <div className="plan-card-price">{p.price.toLocaleString()} <span>{p.currency}/{p.durationMonths}mo</span></div>
            <div className="plan-card-subs"><strong>{p.subscribers}</strong> active subscribers</div>
            <div className="plan-card-subs">Revenue: <strong>{p.revenue}</strong></div>
          </div>
        ))}
        {plans.length === 0 && <div className="empty-state"><p>No plans yet.</p></div>}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-heading)" }}>Per-User Subscriptions</span>
          <select className="filter-select" style={{ marginLeft: "auto" }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Active</option><option>Expired</option><option>Canceled</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>User</th><th>Plan</th><th>Amount</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : subs.results.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><h3>No subscriptions found</h3></div></td></tr>
              ) : subs.results.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{(page - 1) * PER_PAGE + i + 1}</td>
                  <td>{s.user.name}</td>
                  <td>{s.plan}</td>
                  <td>PKR {s.amount.toLocaleString()}</td>
                  <td style={{ fontSize: 12 }}>{new Date(s.startDate).toLocaleDateString()}</td>
                  <td style={{ fontSize: 12 }}>{new Date(s.endDate).toLocaleDateString()}</td>
                  <td><Badge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={subs.total} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>

      {modal?.type === "add" && <PlanModal onClose={() => setModal(null)} onSaved={loadPlans} />}
      {modal?.type === "edit" && <PlanModal plan={modal.plan} onClose={() => setModal(null)} onSaved={loadPlans} />}
    </div>
  );
}
