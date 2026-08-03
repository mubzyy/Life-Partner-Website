import { useState, useRef, useEffect } from "react";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Crown,
  Heart,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  Menu,
  X,
  LayoutDashboard,
  Bookmark,
  Eye,
  Package,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Container from "./Container";

// ── Nav items matching the design exactly ─────────────────────────────────
const navItems = [
  { to: "/dashboard",    label: "Dashboard"  },
  { to: "/search",       label: "Search"     },
  { to: "/matches",      label: "Matches"    },
  { to: "/messages",     label: "Messages",  badge: 3  },
  { to: "/shortlisted",  label: "Shortlisted", badge: 5 },
  { to: "/visitors",     label: "Visitors",  badge: 12 },
  { to: "/subscription", label: "Packages"  },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const markAsRead = async (id, actionUrl) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, { method: "PATCH" }); } catch (e) {}
    if (actionUrl) {
      navigate(actionUrl);
      setNotifOpen(false);
    }
  };

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try { await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/user/${user.id}/read-all`, { method: "PATCH" }); } catch (e) {}
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notification.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    try { await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, { method: "DELETE" }); } catch (e) {}
  };

  const clearAllNotifications = async (e) => {
    e.stopPropagation();
    setNotifications([]);
    setUnreadCount(0);
    try { await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/user/${user.id}`, { method: "DELETE" }); } catch (e) {}
  };

  const getRelativeTime = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return "Yesterday";
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f6f2" }} className="w-full overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════
          PERSISTENT TOP NAVBAR
      ══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e8ebe9] shadow-[0_1px_4px_rgba(0,0,0,0.05)] w-full">
        <Container className="h-[72px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <img
              src={logo}
              alt="Life Partner"
              style={{ height: 52, width: 52, objectFit: "contain", display: "block" }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#0f5d52", letterSpacing: "0.01em" }}>
                Life Partner
              </div>
              <div style={{ fontSize: 10, color: "#7a9490", fontWeight: 500, letterSpacing: "0.02em" }}>
                Find your partner for life
              </div>
            </div>
          </Link>

          {/* ── Desktop nav tabs ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }} className="app-nav-desktop">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isActive ? "#0f5d52" : "#4a5568",
                  background: isActive ? "#edf7f5" : "transparent",
                  transition: "all 0.15s",
                  position: "relative",
                  whiteSpace: "nowrap",
                })}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {item.badge && (
                      <span style={{
                        background: isActive ? "#0f5d52" : "#2d7a6e",
                        color: "#fff",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        lineHeight: "16px",
                        minWidth: 18,
                        textAlign: "center",
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

            {/* Upgrade to Premium button */}
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "linear-gradient(135deg, #d4a843, #c89832)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(212,168,67,0.35)",
              whiteSpace: "nowrap",
            }}
              className="upgrade-btn-desktop"
            >
              <Crown size={15} />
              Upgrade to Premium
            </button>

            {/* Notifications bell */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  border: "2px solid #fff",
                }} />
                {/* Badge */}
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    background: "#0f5d52",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 4px",
                    lineHeight: "14px",
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: 50,
                  width: "min(320px, calc(100vw - 32px))",
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  padding: 16,
                  zIndex: 100,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Notifications</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {unreadCount > 0 && <span style={{ background: "#edf7f5", color: "#0f5d52", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>{unreadCount} new</span>}
                      {notifications.length > 0 && (
                        <>
                          <button onClick={markAllAsRead} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#64748b" }} title="Mark all as read">
                            <CheckCheck size={14} />
                          </button>
                          <button onClick={clearAllNotifications} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#64748b" }} title="Clear all">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ maxHeight: 350, overflowY: "auto", margin: "0 -8px", padding: "0 8px" }}>
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", padding: "20px 0", margin: 0 }}>No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => markAsRead(n.id, n.action_url)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 8px", borderRadius: 10, cursor: "pointer", background: n.is_read ? "transparent" : "#f8fafc", transition: "background 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                          onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "transparent" : "#f8fafc"}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.is_read ? "#cbd5e1" : "#0f5d52", marginTop: 5, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, fontWeight: n.is_read ? 500 : 700, color: "#1e293b", margin: 0 }}>{n.title}</p>
                            <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 4px", lineHeight: 1.4 }}>{n.message}</p>
                            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>{getRelativeTime(n.created_at)}</p>
                          </div>
                          <button onClick={(e) => deleteNotification(e, n.id)} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#cbd5e1", opacity: 0.7 }} title="Delete">
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar + name dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 40,
                  padding: "5px 12px 5px 5px",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}>
                  {(user?.name || user?.first_name || "U")[0].toUpperCase()}
                </div>
                <div style={{ textAlign: "left", lineHeight: 1.3 }} className="user-name-desktop">
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "Guest")}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>View Profile</div>
                </div>
                <ChevronDown size={14} color="#94a3b8" style={{ transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: 52,
                  width: 220,
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  padding: 8,
                  zIndex: 100,
                }}>
                  <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", margin: 0 }}>{user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "Guest")}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{user?.email || "user@example.com"}</p>
                  </div>
                  {[
                    { to: "/profile/me", icon: UserRound, label: "My Profile" },
                    { to: "/settings",   icon: Settings,   label: "Settings"   },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#334155", textDecoration: "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <item.icon size={15} color="#94a3b8" />
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                  <button onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#dc2626", background: "none", border: "none", cursor: "pointer", width: "100%" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
              className="mobile-menu-btn"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </Container>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #f1f5f9", background: "#fff", padding: "12px 20px 16px" }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isActive ? "#0f5d52" : "#334155",
                  background: isActive ? "#edf7f5" : "transparent",
                  marginBottom: 2,
                })}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{ background: "#0f5d52", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* ══ Page content ══ */}
      <main>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 1280px) {
          .app-nav-desktop { display: none !important; }
          .upgrade-btn-desktop { display: none !important; }
          .user-name-desktop { display: none !important; }
        }
        @media (min-width: 1281px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
