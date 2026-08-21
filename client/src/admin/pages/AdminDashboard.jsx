import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  MdPeople, MdVerifiedUser, MdWorkspacePremium, MdPersonAdd,
  MdArrowForward, MdBarChart, MdSettings, MdPhoto, MdCameraAlt, MdBadge,
  MdPersonAddAlt1, MdFactCheck,
} from "react-icons/md";
import { BsArrowUpShort } from "react-icons/bs";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const DONUT_COLORS = ["#2d5e40", "#c9a84c", "#3a6abf", "#a8347a", "#e05c5c"];
const TIER_ORDER = ["Basic", "Premium", "Premium Plus", "Ultimate"];
const verifIcons = { cnic: <MdBadge />, selfie: <MdCameraAlt />, profile_photo: <MdPhoto /> };

function StatCard({ icon, iconClass, label, value, change, compareLabel }) {
  const isUp = change >= 0;
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
        <span className="stat-card-label">{label}</span>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-footer">
        <span className={`stat-card-change ${isUp ? "up" : "down"}`}>
          <BsArrowUpShort style={{ fontSize: 16, transform: isUp ? "none" : "rotate(180deg)" }} />
          {Math.abs(change)}%
        </span>
        <span className="stat-card-compare">{compareLabel}</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-heading)" }}>{payload[0].value.toLocaleString()} users</div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [regPeriod, setRegPeriod] = useState("This Month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/dashboard`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading dashboard…</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "var(--negative)" }}>Failed to load dashboard.</div>;

  const chartData = regPeriod === "This Year" ? data.registrations12mo : data.registrations30d;

  // Real plan names follow "<Tier> — <Duration>" (e.g. "Premium — 3 Months").
  // Group the 16 exact plan/duration rows the backend returns into a
  // tier-level summary — no backend change needed, just a client-side split.
  const tierTotals = {};
  data.subscriptionData.forEach(p => {
    const tier = p.name.split("—")[0].trim();
    tierTotals[tier] = (tierTotals[tier] || 0) + p.value;
  });
  const totalSubs = Object.values(tierTotals).reduce((s, v) => s + v, 0);
  const tierNames = Object.keys(tierTotals).sort((a, b) => {
    const ia = TIER_ORDER.indexOf(a), ib = TIER_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const subscriptionData = tierNames.map((name, i) => ({
    name,
    value: tierTotals[name],
    percent: totalSubs > 0 ? `${((tierTotals[name] / totalSubs) * 100).toFixed(1)}%` : "0.0%",
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  return (
    <div>
      <div className="stat-cards-row">
        <StatCard icon={<MdPeople />} iconClass="icon-bg-green" label="Total Users" value={data.stats.totalUsers.value.toLocaleString()} change={data.stats.totalUsers.change} compareLabel="vs 30 days ago" />
        <StatCard icon={<MdVerifiedUser />} iconClass="icon-bg-teal" label="Verified Users" value={data.stats.verifiedUsers.value.toLocaleString()} change={data.stats.verifiedUsers.change} compareLabel="vs 30 days ago" />
        <StatCard icon={<MdWorkspacePremium />} iconClass="icon-bg-gold" label="Premium Users" value={data.stats.premiumUsers.value.toLocaleString()} change={data.stats.premiumUsers.change} compareLabel="vs 30 days ago" />
        <StatCard icon={<MdPersonAdd />} iconClass="icon-bg-blue" label="Active Today" value={data.stats.activeToday.value.toLocaleString()} change={data.stats.activeToday.change} compareLabel="vs yesterday" />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">User Registrations</div>
            <select className="month-selector" value={regPeriod} onChange={e => setRegPeriod(e.target.value)} style={{ border: "none", outline: "none", cursor: "pointer" }}>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d8a4e" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2d8a4e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ede8" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7a8c82" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: "#7a8c82" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" stroke="#2d8a4e" strokeWidth={2.5} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Subscription Overview</div>
          </div>
          <div className="donut-wrap">
            <div style={{ width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subscriptionData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                    {subscriptionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: "center", marginTop: -80, position: "relative", pointerEvents: "none" }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-heading)" }}>{totalSubs}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Active</div>
              </div>
            </div>
            <div className="donut-legend">
              {subscriptionData.map(item => (
                <div key={item.name} className="donut-legend-item">
                  <div className="donut-legend-label"><div className="donut-dot" style={{ background: item.color }} /><span>{item.name}</span></div>
                  <div className="donut-legend-value">{item.value} <span className="donut-legend-percent">({item.percent})</span></div>
                </div>
              ))}
            </div>
          </div>
          <button className="view-all-link subscription-view-all" onClick={() => navigate("/admin/subscriptions")}>
            View all subscriptions <MdArrowForward />
          </button>
        </div>
      </div>

      <div className="activity-grid">
        <div className="activity-main-col">
          <div className="section-card recent-users-card">
            <div className="section-card-header">
              <span className="section-card-title">Recent Users</span>
              <button className="view-all-link" onClick={() => navigate("/admin/users")}>View All <MdArrowForward /></button>
            </div>
            {data.recentUsers.length === 0 ? (
              <div className="empty-state"><p>No users yet.</p></div>
            ) : (
              <div className="table-scroll">
                <table className="data-table recent-users-table">
                  <thead>
                    <tr><th>User</th><th>Verification</th><th>Subscription</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {data.recentUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-cell">
                            <Avatar initials={u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#2d8a4e" size="sm" img={u.image ? `${API_URL}${u.image}` : null} />
                            <div className="user-cell-info"><h4>{u.name}</h4><span>{u.city}</span></div>
                          </div>
                        </td>
                        <td><Badge status={u.verified ? "Verified" : "Unverified"} /></td>
                        <td style={{ fontSize: 12.5, fontWeight: 500 }}>{u.plan}</td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(u.time).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="activity-sub-row">
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">Pending Verifications</span>
                <button className="view-all-link" onClick={() => navigate("/admin/verifications")}>View All <MdArrowForward /></button>
              </div>
              {data.pendingVerifications.map((v, i) => (
                <div key={i} className="verif-item">
                  <div className="verif-icon">{verifIcons[["cnic", "selfie", "profile_photo"][i]]}</div>
                  <span className="verif-label">{v.label}</span>
                  <span className="verif-count">{v.count}</span>
                </div>
              ))}
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">Recent Payments</span>
                <button className="view-all-link" onClick={() => navigate("/admin/payments")}>View All <MdArrowForward /></button>
              </div>
              {data.recentPayments.length === 0 ? <div className="empty-state"><p>No payments yet.</p></div> : data.recentPayments.map(p => (
                <div key={p.id} className="payment-item">
                  <Avatar initials={p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#c9a84c" size="md" />
                  <div className="payment-info"><h4>{p.name}</h4><span>{p.plan}</span></div>
                  <Badge status={p.status.charAt(0).toUpperCase() + p.status.slice(1)} />
                  <div className="payment-right">
                    <span className="payment-amount">{p.amount}</span>
                    <span className="payment-time">{new Date(p.time).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="activity-side-col">
          <div className="section-card">
            <div className="section-card-header"><span className="section-card-title">Quick Actions</span></div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate("/admin/users?action=add")}>
                <div className="qa-icon" style={{ color: "#2d8a4e" }}><MdPersonAddAlt1 /></div>
                <span>Add User</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate("/admin/verifications")}>
                <div className="qa-icon" style={{ color: "#c9a84c" }}><MdFactCheck /></div>
                <span>Verify Users</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate("/admin/reports")}>
                <div className="qa-icon" style={{ color: "#3a6abf" }}><MdBarChart /></div>
                <span>View Reports</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate("/admin/settings")}>
                <div className="qa-icon" style={{ color: "#7a8c82" }}><MdSettings /></div>
                <span>Platform Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
