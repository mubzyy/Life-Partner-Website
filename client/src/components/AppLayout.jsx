import { useState, useRef, useEffect } from "react";
import BrandMark from "./BrandMark";
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
    <div className="min-h-screen bg-background w-full overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════
          PERSISTENT TOP NAVBAR
      ══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-border-light shadow-sm w-full">
        <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="no-underline shrink-0">
            <BrandMark compact={true} />
          </Link>

          {/* ── Desktop nav tabs ── */}
          <nav className="hidden xl:flex items-center gap-[2px] flex-1 justify-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-[5px] px-[14px] py-[6px] rounded-lg text-[14px] font-semibold no-underline transition-all duration-150 relative whitespace-nowrap ${
                    isActive ? "text-primary bg-primary-light" : "text-text-secondary bg-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {item.badge && (
                      <span className={`text-white rounded-full text-[10px] font-bold py-[1px] px-[6px] leading-[16px] min-w-[18px] text-center ${isActive ? "bg-primary" : "bg-primary-light text-primary"}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side actions ── */}
          <div className="flex items-center gap-[10px] shrink-0">

            {/* Upgrade to Premium button */}
            <button
              className="hidden xl:flex items-center gap-[6px] bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm hover:scale-105 transition-all py-[6px] px-[12px] text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <Crown size={14} />
              Premium
            </button>

            {/* Notifications bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative w-[40px] h-[40px] rounded-full border-[1.5px] border-border-light bg-white flex items-center justify-center cursor-pointer text-text-secondary"
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span className="absolute top-[8px] right-[8px] w-[8px] h-[8px] rounded-full bg-green-500 border-2 border-white" />
                {/* Badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-[2px] right-[2px] bg-primary text-white rounded-full text-[9px] font-bold py-[1px] px-[4px] leading-[14px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-[50px] w-[min(320px,calc(100vw-32px))] bg-card border border-border-light shadow-sm rounded-[16px] p-4 z-[100]">
                  <div className="flex justify-between mb-3 items-center">
                    <span className="font-bold text-[14px] text-text-primary">Notifications</span>
                    <div className="flex gap-2 items-center">
                      {unreadCount > 0 && <span className="bg-primary-light text-primary rounded-full text-[11px] font-bold py-[2px] px-[8px]">{unreadCount} new</span>}
                      {notifications.length > 0 && (
                        <>
                          <button onClick={markAllAsRead} className="bg-transparent border-none p-1 cursor-pointer text-text-muted hover:text-primary" title="Mark all as read">
                            <CheckCheck size={14} />
                          </button>
                          <button onClick={clearAllNotifications} className="bg-transparent border-none p-1 cursor-pointer text-text-muted hover:text-primary" title="Clear all">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto -mx-2 px-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-[13px] text-text-muted py-[20px] m-0">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => markAsRead(n.id, n.action_url)} className={`flex items-start gap-[10px] p-[10px_8px] rounded-[10px] cursor-pointer transition-colors duration-200 hover:bg-slate-50 ${n.is_read ? 'bg-transparent' : 'bg-slate-50'}`}>
                          <div className={`w-2 h-2 rounded-full mt-[5px] shrink-0 ${n.is_read ? 'bg-border-light' : 'bg-primary'}`} />
                          <div className="flex-1">
                            <p className={`text-[12px] text-text-primary m-0 ${n.is_read ? 'font-medium' : 'font-bold'}`}>{n.title}</p>
                            <p className="text-[11px] text-text-secondary m-[2px_0_4px] leading-[1.4]">{n.message}</p>
                            <p className="text-[10px] text-text-muted m-0">{getRelativeTime(n.created_at)}</p>
                          </div>
                          <button onClick={(e) => deleteNotification(e, n.id)} className="bg-transparent border-none p-1 cursor-pointer text-text-muted opacity-70 hover:opacity-100" title="Delete">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 bg-white border-[1.5px] border-border-light rounded-[40px] p-[5px_12px_5px_5px] cursor-pointer"
              >
                <div className="w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center text-white font-bold text-[13px] shrink-0">
                  {(user?.name || user?.first_name || "U")[0].toUpperCase()}
                </div>
                <div className="text-left leading-[1.3] hidden xl:block">
                  <div className="text-[13px] font-bold text-text-primary">{user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "Guest")}</div>
                  <div className="text-[10px] text-text-secondary font-medium">View Profile</div>
                </div>
                <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-[52px] w-[220px] bg-card border border-border-light shadow-sm rounded-[16px] p-2 z-[100]">
                  <div className="p-[8px_12px_10px] border-b border-border-light mb-1">
                    <p className="font-bold text-[13px] text-text-primary m-0">{user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "Guest")}</p>
                    <p className="text-[11px] text-text-secondary m-[2px_0_0]">{user?.email || "user@example.com"}</p>
                  </div>
                  {[
                    { to: "/profile/me", icon: UserRound, label: "My Profile" },
                    { to: "/settings",   icon: Settings,   label: "Settings"   },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-[10px] p-[9px_12px] rounded-[10px] text-[13px] font-semibold text-text-secondary no-underline hover:bg-slate-50"
                    >
                      <item.icon size={15} className="text-text-muted" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-[1px] bg-border-light my-1" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-[10px] p-[9px_12px] rounded-[10px] text-[13px] font-semibold text-red-600 bg-transparent border-none cursor-pointer w-full hover:bg-red-50"
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
              className="xl:hidden w-[40px] h-[40px] rounded-full border-[1.5px] border-border-light bg-white flex items-center justify-center cursor-pointer text-text-secondary"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border-light bg-white p-[12px_20px_16px]">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between p-[10px_12px] rounded-[10px] text-[14px] font-semibold no-underline mb-[2px] ${
                    isActive ? "text-primary bg-primary-light" : "text-text-secondary bg-transparent"
                  }`
                }
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-primary text-white rounded-full text-[10px] font-bold py-[1px] px-[7px]">
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
    </div>
  );
};

export default AppLayout;
