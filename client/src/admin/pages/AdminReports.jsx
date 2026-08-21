import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { MdAttachMoney, MdPersonAdd, MdTrendingUp, MdAccountBalanceWallet } from "react-icons/md";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ["#2d5e40", "#c9a84c", "#a8bfb0", "#f0c040", "#3a6abf", "#e05c5c"];

function StatCard({ icon, iconClass, label, value, change }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top"><div className={`stat-card-icon ${iconClass}`}>{icon}</div></div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-footer">
        <span className="stat-card-compare">{label}</span>
        {change !== null && change !== undefined && (
          <span className={`stat-card-change ${change >= 0 ? "up" : "down"}`}>{change >= 0 ? "+" : ""}{change}%</span>
        )}
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/reports`).then(res => res.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading…</p></div>;
  if (!data) return <div className="empty-state"><h3>Failed to load reports.</h3></div>;

  const { reportStats: s } = data;

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h2>Reports</h2><p>Real revenue and growth analytics</p></div></div>

      <div className="reports-stats-row">
        <StatCard icon={<MdAttachMoney />} iconClass="icon-bg-green" label="Total Revenue" value={`PKR ${s.totalRevenue.value.toLocaleString()}`} change={s.totalRevenue.change} />
        <StatCard icon={<MdPersonAdd />} iconClass="icon-bg-blue" label="New Users (30d)" value={s.newUsers.value.toLocaleString()} change={s.newUsers.change} />
        <StatCard icon={<MdTrendingUp />} iconClass="icon-bg-gold" label="Conversion Rate" value={`${s.conversionRate.value}%`} change={s.conversionRate.change} />
        <StatCard icon={<MdAccountBalanceWallet />} iconClass="icon-bg-teal" label="Avg Revenue / Paying User" value={`PKR ${s.avgRevenuePerUser.value.toLocaleString()}`} change={s.avgRevenuePerUser.change} />
      </div>

      <div className="reports-charts-row">
        <div className="chart-card">
          <div className="chart-card-header"><div className="chart-card-title">Monthly Revenue (Last 12 Months)</div></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyRevenue} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4ede8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a8c82" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a8c82" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`PKR ${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#2d8a4e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-card-header"><div className="chart-card-title">Revenue by Plan</div></div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.revenueByPlan} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={(entry) => entry.name}>
                {data.revenueByPlan.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`PKR ${v.toLocaleString()}`, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
