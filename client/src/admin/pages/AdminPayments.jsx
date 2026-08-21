import { useState, useEffect, useCallback } from "react";
import { MdSearch, MdAttachMoney, MdCheckCircle, MdCancel, MdHourglassEmpty } from "react-icons/md";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const PER_PAGE = 10;

export default function AdminPayments() {
  const [data, setData] = useState({ results: [], total: 0 });
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (search) params.set("search", search);
    if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());
    adminFetch(`${API_URL}/api/admin/payments?${params}`).then(res => res.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/payments/summary`).then(res => res.json()).then(setSummary).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h2>Payments</h2><p>Real transaction history</p></div>
      </div>

      {summary && (
        <div className="payment-summary-row">
          <div className="stat-card">
            <div className="stat-card-top"><div className="stat-card-icon icon-bg-green"><MdAttachMoney /></div></div>
            <div className="stat-card-value">PKR {summary.totalRevenue.toLocaleString()}</div>
            <div className="stat-card-footer"><span className="stat-card-compare">Total Revenue</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top"><div className="stat-card-icon icon-bg-teal"><MdCheckCircle /></div></div>
            <div className="stat-card-value">{summary.successRate}%</div>
            <div className="stat-card-footer"><span className="stat-card-compare">Success Rate</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top"><div className="stat-card-icon icon-bg-blue"><MdCancel /></div></div>
            <div className="stat-card-value">{summary.failed}</div>
            <div className="stat-card-footer"><span className="stat-card-compare">Failed</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top"><div className="stat-card-icon icon-bg-gold"><MdHourglassEmpty /></div></div>
            <div className="stat-card-value">{summary.pending}</div>
            <div className="stat-card-footer"><span className="stat-card-compare">Pending</span></div>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <span className="search-icon"><MdSearch /></span>
            <input type="text" placeholder="Search by user..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Completed</option><option>Failed</option><option>Pending</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Txn ID</th><th>User</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
              ) : data.results.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><h3>No payments found</h3></div></td></tr>
              ) : data.results.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{p.id}</td>
                  <td>{p.user.name}</td>
                  <td>{p.plan}</td>
                  <td>{p.currency} {p.amount.toLocaleString()}</td>
                  <td style={{ fontSize: 12 }}>{p.method}</td>
                  <td><Badge status={p.status} /></td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(p.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={data.total} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>
    </div>
  );
}
