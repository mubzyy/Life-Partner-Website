import { useState, useEffect, useCallback } from "react";
import {
  MdSearch, MdBadge, MdCameraAlt, MdPhoto, MdCheck, MdClose, MdVisibility,
} from "react-icons/md";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const PER_PAGE = 10;

const TYPE_LABELS = { cnic: "CNIC", selfie: "Selfie", profile_photo: "Profile Photo" };
const typeIcons = {
  cnic: { icon: <MdBadge />, bg: "#e2f0e8", color: "#2d8a4e" },
  selfie: { icon: <MdCameraAlt />, bg: "#e5ecf8", color: "#3a6abf" },
  profile_photo: { icon: <MdPhoto />, bg: "#e5f2fa", color: "#3a8fc8" },
};
const STATUS_LABEL = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

function ReviewModal({ verif, action, onClose, onDone }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const isApprove = action === "approve";

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await adminFetch(`${API_URL}/api/admin/verifications/${verif.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isApprove ? "approved" : "rejected", note }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      onDone();
      setDone(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (done) return (
    <Modal title="Review Complete" onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
      <div className="success-state">
        <div className="success-icon" style={{ background: isApprove ? "var(--positive-bg)" : "var(--negative-bg)", color: isApprove ? "var(--positive)" : "var(--negative)" }}>
          {isApprove ? "✓" : "✗"}
        </div>
        <h3>{isApprove ? "Verification Approved!" : "Verification Rejected"}</h3>
        <p>{verif.user.name}'s {TYPE_LABELS[verif.type]} verification has been {isApprove ? "approved" : "rejected"}.</p>
      </div>
    </Modal>
  );

  return (
    <Modal title={`${isApprove ? "Approve" : "Reject"} Verification`} onClose={onClose} footer={
      <>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className={`btn ${isApprove ? "btn-primary" : "btn-danger"}`} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : isApprove ? "Approve" : "Reject"}
        </button>
      </>
    }>
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "0 0 16px", borderBottom: "1px solid var(--border-light)", marginBottom: 16 }}>
        <Avatar initials={verif.user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#c9a84c" size="md" img={verif.user.image ? `${API_URL}${verif.user.image}` : null} />
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-heading)" }}>{verif.user.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{TYPE_LABELS[verif.type]} Verification · {new Date(verif.submittedAt).toLocaleString()}</div>
        </div>
      </div>
      {verif.hasDocument && (
        <div className="form-group">
          <a className="btn btn-outline btn-sm" href={`${API_URL}/api/admin/verifications/${verif.id}/document`} target="_blank" rel="noreferrer">
            <MdVisibility /> View Submitted Document
          </a>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Review Note (Optional)</label>
        <textarea className="form-textarea" placeholder={`Reason for ${isApprove ? "approval" : "rejection"}...`} value={note} onChange={e => setNote(e.target.value)} rows={3} />
      </div>
    </Modal>
  );
}

export default function AdminVerifications() {
  const [data, setData] = useState({ results: [], total: 0, summary: { pending: 0, approved: 0, rejected: 0 } });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (search) params.set("search", search);
    if (typeFilter !== "All") params.set("type", typeFilter);
    if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());
    adminFetch(`${API_URL}/api/admin/verifications?${params}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h2>Verifications</h2><p>Review and process real identity-verification requests</p></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
        {[
          { label: "Pending", count: data.summary.pending, bg: "#fef3e2", color: "#e8a030", border: "#fde8b0" },
          { label: "Approved", count: data.summary.approved, bg: "var(--positive-bg)", color: "var(--positive)", border: "#b8e4c8" },
          { label: "Rejected", count: data.summary.rejected, bg: "var(--negative-bg)", color: "var(--negative)", border: "#f5c0c0" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-heading)" }}>{s.count}</div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <span className="search-icon"><MdSearch /></span>
            <input type="text" placeholder="Search by user..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="All">All Types</option>
            <option value="cnic">CNIC</option>
            <option value="selfie">Selfie</option>
            <option value="profile_photo">Profile Photo</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>User</th><th>Type</th><th>Status</th><th>Submitted</th><th>Reviewed By</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : data.results.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">✅</div><h3>No verifications found</h3></div></td></tr>
              ) : data.results.map((v, i) => {
                const ti = typeIcons[v.type] || typeIcons.cnic;
                return (
                  <tr key={v.id}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      <div className="user-cell">
                        <Avatar initials={v.user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#c9a84c" size="sm" img={v.user.image ? `${API_URL}${v.user.image}` : null} />
                        <div className="user-cell-info"><h4>{v.user.name}</h4><span>{v.user.city}</span></div>
                      </div>
                    </td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div className="verif-row-icon" style={{ background: ti.bg, color: ti.color, width: 28, height: 28, fontSize: 14 }}>{ti.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{TYPE_LABELS[v.type]}</span>
                    </div></td>
                    <td><Badge status={STATUS_LABEL[v.status]} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(v.submittedAt).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{v.reviewedBy || "—"}</td>
                    <td>
                      <div className="table-actions">
                        {v.hasDocument && (
                          <a className="btn btn-sm btn-outline btn-icon" title="View Document" href={`${API_URL}/api/admin/verifications/${v.id}/document`} target="_blank" rel="noreferrer">
                            <MdVisibility />
                          </a>
                        )}
                        {v.status === "pending" && (
                          <>
                            <button className="btn btn-sm btn-outline btn-icon" title="Approve" style={{ color: "var(--positive)" }} onClick={() => setModal({ action: "approve", verif: v })}><MdCheck /></button>
                            <button className="btn btn-sm btn-outline btn-icon" title="Reject" style={{ color: "var(--negative)" }} onClick={() => setModal({ action: "reject", verif: v })}><MdClose /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination total={data.total} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>

      {modal && <ReviewModal verif={modal.verif} action={modal.action} onClose={() => setModal(null)} onDone={load} />}
    </div>
  );
}
