import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  MdDashboard, MdPeople, MdPersonSearch, MdVerifiedUser,
  MdBarChart, MdSubscriptions, MdPayment, MdNotifications, MdSettings,
  MdSearch, MdKeyboardArrowDown,
} from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useAdminAuth } from "./context/AdminAuthContext";
import AdminBrandMark from "./components/AdminBrandMark";
import Avatar from "./components/ui/Avatar";
import { adminFetch } from "./lib/adminFetch";
import "./admin.css";

const API_URL = import.meta.env.VITE_API_URL;

const navItems = [
  { label: "Dashboard", path: "/admin", icon: <MdDashboard /> },
  { label: "Users", path: "/admin/users", icon: <MdPeople /> },
  { label: "Profiles", path: "/admin/profiles", icon: <MdPersonSearch /> },
  { label: "Verifications", path: "/admin/verifications", icon: <MdVerifiedUser /> },
  { label: "Reports", path: "/admin/reports", icon: <MdBarChart /> },
  { label: "Subscriptions", path: "/admin/subscriptions", icon: <MdSubscriptions /> },
  { label: "Payments", path: "/admin/payments", icon: <MdPayment /> },
  { label: "Notifications", path: "/admin/notifications", icon: <MdNotifications /> },
  { label: "Settings", path: "/admin/settings", icon: <MdSettings /> },
];

const pageMeta = {
  "/admin": { title: "Dashboard", sub: "Welcome back! Here's the latest activity across the platform." },
  "/admin/users": { title: "Users" },
  "/admin/profiles": { title: "Profiles" },
  "/admin/verifications": { title: "Verifications" },
  "/admin/reports": { title: "Reports" },
  "/admin/subscriptions": { title: "Subscriptions" },
  "/admin/payments": { title: "Payments" },
  "/admin/notifications": { title: "Notifications" },
  "/admin/settings": { title: "Settings" },
};

function initialsOf(name) {
  return (name || "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminLayout() {
  const { admin, adminSignOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState([]);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const adminName = admin?.username || "Admin";
  const meta = pageMeta[location.pathname] || pageMeta["/admin"];

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/notifications/activity`)
      .then(res => res.ok ? res.json() : [])
      .then(setActivity)
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/admin/users?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    adminSignOut();
    navigate("/admin/login");
  };

  const activityLabel = (a) => {
    if (a.type === "user") return `${a.label} just registered.`;
    if (a.type === "payment") return `Payment received from ${a.label}.`;
    if (a.type === "verif") return `${a.label} submitted a ${a.extra} verification.`;
    if (a.type === "report") return `${a.label} filed a report.`;
    return a.label;
  };
  const activityIcon = { user: "👤", payment: "💳", verif: "✅", report: "📊" };

  return (
    <div className="crm-app">
      <div className="app-shell">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-img-wrap">
              {/* Scaled down via inline transform (guaranteed to win over
                  AdminBrandMark's own Tailwind classes) — the 190px sidebar
                  is narrower than the mark's normal full-size rendering. */}
              <div style={{ transform: "scale(0.72)", transformOrigin: "center" }}>
                <AdminBrandMark compact />
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user" onClick={() => navigate("/admin/settings")}>
              <Avatar initials={initialsOf(adminName)} color="#c9a84c" size="sm" />
              <div className="sidebar-user-info">
                <h4>{adminName}</h4>
                <span>Administrator</span>
              </div>
              <button className="sidebar-user-menu" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Sign out">
                <BsThreeDotsVertical />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="main-area">
          <header className="header">
            <div className="header-title-block">
              <h1>{meta.title}</h1>
              {meta.sub && <p>{meta.sub}</p>}
            </div>
            <div className="header-spacer" />

            <form className="header-search" onSubmit={handleSearch}>
              <span className="header-search-icon"><MdSearch /></span>
              <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>

            <div className="header-actions">
              <div ref={notifRef} style={{ position: "relative" }}>
                <button className="header-notif-btn" onClick={() => setNotifOpen(v => !v)} aria-label="Notifications">
                  <MdNotifications />
                  {activity.length > 0 && <span className="notif-badge">{activity.length > 9 ? "9+" : activity.length}</span>}
                </button>
                {notifOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "var(--white)", border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-lg)", boxShadow: "var(--card-shadow-hover)",
                    width: 340, zIndex: 200, overflow: "hidden", maxHeight: 420, overflowY: "auto",
                  }}>
                    <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border-light)", fontWeight: 700, fontSize: 14, color: "var(--text-heading)" }}>
                      Recent Activity
                    </div>
                    {activity.length === 0 ? (
                      <div style={{ padding: "20px 16px", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Nothing yet.</div>
                    ) : activity.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--border-light)" }}>
                        <div style={{ fontSize: 18 }}>{activityIcon[a.type] || "🔔"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, color: "var(--text-body)" }}>{activityLabel(a)}</div>
                          <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 3 }}>{new Date(a.time).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div ref={userRef} style={{ position: "relative" }}>
                <div className="header-user" onClick={() => setMenuOpen(v => !v)}>
                  <div className="avatar avatar-md" style={{ background: "#c9a84c", width: 38, height: 38, minWidth: 38 }}>
                    {initialsOf(adminName)}
                  </div>
                  <div className="header-user-info">
                    <h4>{adminName}</h4>
                    <span>Administrator</span>
                  </div>
                  <span className="header-user-chevron"><MdKeyboardArrowDown /></span>
                </div>
                {menuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "var(--white)", border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-lg)", boxShadow: "var(--card-shadow-hover)",
                    minWidth: 180, overflow: "hidden", zIndex: 200,
                  }}>
                    {[
                      { label: "Platform Settings", action: () => navigate("/admin/settings") },
                      { label: "Sign Out", action: handleLogout },
                    ].map(item => (
                      <button key={item.label} onClick={() => { item.action(); setMenuOpen(false); }}
                        style={{
                          display: "block", width: "100%", padding: "10px 16px", textAlign: "left",
                          fontSize: 13, color: "var(--text-body)", borderBottom: "1px solid var(--border-light)",
                          background: "none", cursor: "pointer",
                        }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
