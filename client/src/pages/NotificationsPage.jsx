import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, CheckCheck, Trash2, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { authFetch } from "../lib/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

// Real notifications page — same GET/PATCH/DELETE /api/notifications
// endpoints the header bell dropdown (AppLayout.jsx) already uses, just as
// a full list instead of a 320px popover.
const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    authFetch(`${API_URL}/api/notifications`)
      .then(res => res.ok ? res.json() : [])
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getRelativeTime = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return "Yesterday";
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const markAsRead = async (n) => {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    try { await authFetch(`${API_URL}/api/notifications/${n.id}/read`, { method: "PATCH" }); } catch (e) {}
    if (n.action_url) navigate(n.action_url);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try { await authFetch(`${API_URL}/api/notifications/read-all`, { method: "PATCH" }); } catch (e) {}
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    try { await authFetch(`${API_URL}/api/notifications/${id}`, { method: "DELETE" }); } catch (e) {}
  };

  const clearAll = async () => {
    setNotifications([]);
    try { await authFetch(`${API_URL}/api/notifications`, { method: "DELETE" }); } catch (e) {}
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8">
      <div className="w-full max-w-[800px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={20} className="text-[#E91E63]" />
            </div>
            <div>
              <h1 className="text-[26px] font-bold text-slate-800 mb-1 leading-none">Notifications</h1>
              <p className="text-[13px] text-slate-500 m-0">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up."}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <CheckCheck size={14} /> Mark all read
              </button>
              <button onClick={clearAll} className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-[13px]">Loading…</div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="No notifications yet"
              description="When you get new matches, messages, or profile views, they'll appear here."
            />
          ) : (
            notifications.map((n, idx) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n)}
                className={`flex items-start gap-3 px-5 md:px-7 py-4 cursor-pointer hover:bg-[#fff9fb] transition-colors ${idx < notifications.length - 1 ? "border-b border-slate-100" : ""} ${!n.is_read ? "bg-[#fffafb]" : ""}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.is_read ? "bg-slate-200" : "bg-[#E91E63]"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] text-slate-800 m-0 break-words ${n.is_read ? "font-medium" : "font-bold"}`}>{n.title}</p>
                  <p className="text-[13px] text-slate-500 m-[3px_0_5px] leading-relaxed break-words">{n.message}</p>
                  <p className="text-[11px] text-slate-400 m-0">{getRelativeTime(n.created_at)}</p>
                </div>
                <button onClick={(e) => deleteOne(e, n.id)} title="Delete" className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1 shrink-0">
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
