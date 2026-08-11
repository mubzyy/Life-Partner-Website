import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart, MessageSquare, Eye, ChevronRight, ChevronLeft,
  Shield, MapPin, GraduationCap, Crown, Check,
} from "lucide-react";
import { authFetch } from "../lib/authFetch";
import { photoUrl } from "../lib/photoUrl";

const getAvatarBg = (i) => ["bg-[#2d7a6e]", "bg-[#6b4c8a]", "bg-[#2d6e7e]", "bg-[#7a6e2d]", "bg-[#4c6e2d]"][i % 5];
const getAvatarGradient = (i) => ["bg-gradient-to-br from-[#2d7a6e33] to-[#2d7a6e66]", "bg-gradient-to-br from-[#6b4c8a33] to-[#6b4c8a66]", "bg-gradient-to-br from-[#2d6e7e33] to-[#2d6e7e66]", "bg-gradient-to-br from-[#7a6e2d33] to-[#7a6e2d66]", "bg-gradient-to-br from-[#4c6e2d33] to-[#4c6e2d66]"][i % 5];

// Simple sparkline data for activity chart
const chartData = [10, 18, 14, 22, 20, 30, 25, 35, 28, 38, 32, 40, 36, 23];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [heartedCards, setHeartedCards] = useState({});
  const [dashboardData, setDashboardData] = useState({ stats: {}, recentActivity: [] });
  const [recentMessages, setRecentMessages] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    authFetch(`${import.meta.env.VITE_API_URL}/api/matches`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMatches(data.slice(0, 4));
        }
        setMatchesLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMatchesLoading(false);
      });

    authFetch(`${import.meta.env.VITE_API_URL}/api/favorites`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(item => { map[item.target_profile_id] = true; });
          setHeartedCards(map);
        }
      })
      .catch(console.error);

    authFetch(`${import.meta.env.VITE_API_URL}/api/dashboard`)
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(console.error);

    authFetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setRecentMessages(data.slice(0, 3).map(c => ({
                    name: c.name,
                    msg: c.lastMessage,
                    time: c.time ? new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New",
                    unread: c.unread,
                    image: c.image
                })));
            }
        })
        .catch(console.error);

    authFetch(`${import.meta.env.VITE_API_URL}/api/visitors`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setVisitors(data.slice(0, 3));
            }
        })
        .catch(console.error);
  }, []);

  // Real, backend-calculated profile completion (server/lib/profileCompletion.js)
  // — the same number shown on the Complete Profile wizard and My Profile.
  // No hardcoded percentage and no local recalculation here.
  useEffect(() => {
    if (user?.id) refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const completion = profile?.completion?.profileCompletion ?? 0;

  const toggleHeart = async (id) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_profile_id: id })
      });
      if (res.ok) {
        setHeartedCards(h => ({ ...h, [id]: !h[id] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SVG sparkline
  const maxVal = Math.max(...chartData);
  const w = 600, h = 120;
  const pts = chartData.map((v, i) => `${(i / (chartData.length - 1)) * w},${h - (v / maxVal) * (h - 10) - 5}`).join(" ");

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background px-4 md:px-6 py-6 md:py-10">
      <div className="w-full max-w-[1920px] 2xl:px-8 mx-auto">

        {/* ── Main 2-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] 2xl:grid-cols-[1fr_360px] 3xl:grid-cols-[1fr_400px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Welcome banner */}
            <div className="bg-card rounded-[20px] px-7 py-6 border border-border-light  grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="flex items-center gap-4">
                <div className="w-[54px] h-[54px] rounded-full bg-primary flex items-center justify-center text-[22px] font-bold text-white shrink-0 overflow-hidden">
                  {profile?.profile_photo_url ? (
                    <img src={photoUrl(profile.profile_photo_url)} alt="Your profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] ?? user?.first_name?.[0] ?? "A"
                  )}
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-text-primary mb-1">
                    Assalamualaikum, {user?.name?.split(" ")[0] || user?.first_name || "Guest"}! 👋
                  </h1>
                  <p className="text-[13px] text-text-secondary m-0">Welcome back! You have {dashboardData.stats?.matches || 0} matches.</p>
                </div>
              </div>
              {/* Quran verse */}
              <div className="relative overflow-hidden bg-card rounded-[20px] px-6 py-5 text-center border border-border-light shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary/20">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="mb-2 opacity-30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.3 6.2H5.8L3 11V18H11.3V6.2ZM21 6.2H15.5L12.7 11V18H21V6.2Z" fill="currentColor" className="text-primary"/>
                  </svg>
                </div>
                <div className="relative z-10 w-full">
                  <p 
                    className="text-[26px] sm:text-[30px] text-text-primary leading-loose font-normal mb-1" 
                    dir="rtl" 
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    وَخَلَقَ كُلَّ شَيْءٍ فَقَدَّرَهُ تَقْدِيرًا
                  </p>
                  <div className="w-12 h-[2px] bg-primary/20 mx-auto my-3 rounded-full"></div>
                  <p className="text-[13px] text-text-secondary font-medium tracking-wide mb-3 px-2 italic">
                    "And He created everything and determined it with precision."
                  </p>
                  <div className="inline-block bg-primary-very-light rounded-full px-3 py-1">
                    <p className="text-[10px] text-primary font-bold tracking-widest uppercase m-0">Quran 25:2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="pb-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
              {[
                { label: "Matches",       value: dashboardData.stats?.matches || 0, sub: "Based on mutual likes",   icon: "👥", color: "currentColor" },
                { label: "Messages",      value: dashboardData.stats?.messages || 0,  sub: "Unread threads",          icon: "💬", color: "currentColor" },
                { label: "Profile Views", value: dashboardData.stats?.views || 0, sub: "Total profile views",       icon: "👁️", color: "currentColor" },
                { label: "Who Likes Me",  value: dashboardData.stats?.likes || 0, sub: "Total likes received",             icon: "❤️", color: "#e11d48" },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-2xl p-5 xl:p-6 border border-border-light shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-very-light flex items-center justify-center text-lg">
                      {s.icon}
                    </div>
                    <div className="text-[13px] text-text-secondary font-medium">{s.label}</div>
                  </div>
                  <div className="text-[32px] font-extrabold text-text-primary leading-none">{s.value}</div>
                  <div className="text-xs text-primary font-medium mt-1.5">{s.sub}</div>
                </div>
              ))}
              </div>
            </div>

            {/* Recommended Matches */}
            <div className="bg-card rounded-2xl p-6 border border-border-light shadow-sm ">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <h2 className="text-[17px] font-bold text-text-primary m-0">Recommended Matches</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/matches" className="text-[13px] font-bold text-primary no-underline hover:text-primary-dark transition-colors">View All Matches</Link>
                  <button className="w-7 h-7 rounded-full border border-border-light border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={14} className="text-text-muted" />
                  </button>
                  <button className="w-7 h-7 rounded-full border border-border-light border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ChevronRight size={14} className="text-text-muted" />
                  </button>
                </div>
              </div>

              <div className="pb-4 w-full">
                {matchesLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-10 text-text-muted text-[13px]">
                    No recommended matches yet. Try completing your profile or updating your preferences!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {matches.map((m, i) => (
                  <div key={m.id} className="rounded-2xl border border-border-light  overflow-hidden bg-card hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {/* Photo */}
                    <div className={`h-[140px] relative flex items-center justify-center bg-primary-very-light overflow-hidden`}>
                      <img src={photoUrl(m.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=e91e63&color=fff&size=200`} alt={m.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=e91e63&color=fff&size=200`; e.target.onerror = null; }} />
                      {/* Online dot */}
                      {m.online && (
                        <div className="absolute top-2.5 left-2.5 bg-green-500 text-white rounded-md text-[10px] font-bold py-0.5 px-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-card" />
                          Online
                        </div>
                      )}
                      {/* Heart */}
                      <button onClick={() => toggleHeart(m.id)}
                        className="absolute bottom-2.5 right-2.5 w-[30px] h-[30px] rounded-full bg-card border border-border-light border-border-light cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <Heart size={14} className={heartedCards[m.id] ? "text-rose-600" : "text-text-muted"} fill={heartedCards[m.id] ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="px-3.5 pt-3 pb-3.5">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-bold text-[13px] text-text-primary capitalize">{m.name}, {m.age}</span>
                        <span className="text-primary text-xs">✓</span>
                      </div>
                      <div className="text-xs text-text-secondary mb-1.5">{m.profession}</div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1 mb-1">
                        <MapPin size={10} /> {m.city}
                      </div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1 mb-3">
                        <GraduationCap size={10} /> {m.edu}
                      </div>
                      <Link to={`/profile/${m.id}`} className="block text-center py-1.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all no-underline">
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
                </div>
                )}
              </div>
            </div>

            {/* Bottom 3-column: Messages | Visitors | Chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Recent Messages */}
              <div className="bg-card rounded-2xl p-5 border border-border-light shadow-sm">
                <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-bold text-text-primary m-0">Recent Messages</h3>
                  <Link to="/messages" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</Link>
                </div>
                {recentMessages.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3.5">
                    <img src={photoUrl(m.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=e91e63&color=fff&size=100`} alt={m.name} className="w-[38px] h-[38px] rounded-full object-cover shrink-0" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=e91e63&color=fff&size=100`; e.target.onerror = null; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="text-[13px] font-bold text-text-primary">{m.name}</span>
                        <span className="text-[10px] text-text-muted">{m.time}</span>
                      </div>
                      <div className="text-[11px] text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{m.msg}</div>
                    </div>
                    {m.unread > 0 && (
                      <div className="w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">{m.unread}</div>
                    )}
                  </div>
                ))}
                  </div>
                </div>

              {/* Profile Visitors */}
              <div className="bg-card rounded-2xl p-5 border border-border-light shadow-sm">
                <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-bold text-text-primary m-0">Profile Visitors</h3>
                  <Link to="/visitors" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</Link>
                </div>
                {visitors.map((v, i) => (
                  <div key={i} className="flex items-center justify-between gap-2.5 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <img src={photoUrl(v.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=e91e63&color=fff&size=100`} alt={v.name} className="w-[38px] h-[38px] rounded-full object-cover shrink-0" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=e91e63&color=fff&size=100`; e.target.onerror = null; }} />
                      <div>
                        <div className="text-[13px] font-bold text-text-primary">{v.name}</div>
                        <div className="text-[11px] text-text-muted">{v.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-text-muted">{v.time}</div>
                      <Eye size={14} className="text-primary mt-1 ml-auto" />
                    </div>
                  </div>
                ))}
                  </div>
                </div>

              {/* Activity chart */}
              <div className="bg-card rounded-2xl p-5 border border-border-light shadow-sm ">
                <h3 className="text-[15px] font-bold text-text-primary mb-1">Your Activity Overview</h3>
                <div className="w-full overflow-hidden mt-4">
                  <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-auto">
                    {/* Grid lines */}
                    {[0, 10, 20, 30, 40].map(v => (
                      <g key={v}>
                        <line x1="0" y1={h - (v / 40) * (h - 10) - 5} x2={w} y2={h - (v / 40) * (h - 10) - 5} stroke="#f1f5f9" strokeWidth="1" />
                        <text x="0" y={h - (v / 40) * (h - 10) - 5} fontSize="14" fill="#94a3b8">{v}</text>
                      </g>
                    ))}
                    {/* Line */}
                    <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Dots */}
                    {chartData.map((v, i) => (
                      <circle key={i} cx={(i / (chartData.length - 1)) * w} cy={h - (v / maxVal) * (h - 10) - 5} r="5" fill="currentColor" />
                    ))}
                    {/* Day labels */}
                    {days.map((d, i) => (
                      <text key={d} x={(i / (days.length - 1)) * w} y={h + 18} fontSize="14" fill="#94a3b8" textAnchor="middle">{d}</text>
                    ))}
                  </svg>
                </div>
                {/* Legend */}
                <div className="flex gap-4 mt-2 flex-wrap">
                  {[
                    { color: "bg-primary", label: "23 Profile Views"  },
                    { color: "bg-primary", label: "12 New Matches"     },
                    { color: "bg-[#6b8a86]", label: "8 Messages Sent"    },
                    { color: "bg-rose-600", label: "17 Likes Received"  },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-[11px] text-text-secondary">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy banner */}
            <div className="bg-card rounded-2xl py-4 px-5 border border-border-light  flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-xl bg-primary-very-light flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm text-text-primary">Your privacy and security are our top priority</div>
                  <div className="text-xs text-text-secondary">We verify every profile manually to ensure a safe and trusted community.</div>
                </div>
              </div>
              <Link to="/settings" className="text-[13px] font-bold text-primary no-underline whitespace-nowrap hover:text-primary-dark transition-colors">Learn More →</Link>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* Profile Completion */}
            <div className="bg-card rounded-[20px] p-[22px] border border-border-light ">
              <h3 className="text-[15px] font-bold text-text-primary mb-2">Profile Completion</h3>
              <p className="text-xs text-text-secondary mb-4">Complete your profile to get better matches</p>
              {/* Ring */}
              <div className="flex justify-center mb-4">
                <div className="relative w-[80px] h-[80px]">
                  <svg viewBox="0 0 80 80" className="-rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e8ebe9" strokeWidth="8" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 34 * (completion / 100)} ${2 * Math.PI * 34}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold text-text-primary">{completion}%</div>
                </div>
              </div>
              <Link to="/profile-setup" className="block text-center w-full py-2.5 text-[13px] font-bold cursor-pointer border-none bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all no-underline">
                Complete Profile
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-[20px] p-[22px] border border-border-light ">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-text-primary m-0">Recent Activity</h3>
                <Link to="/notifications" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</Link>
              </div>
              {(dashboardData.recentActivity || []).length === 0 ? (
                  <div className="text-[13px] text-text-muted">No recent activity yet.</div>
              ) : dashboardData.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 mb-3.5">
                  <div className="relative shrink-0">
                    <img src={photoUrl(a.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=e91e63&color=fff&size=100`} alt={a.name} className="w-9 h-9 rounded-full object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=e91e63&color=fff&size=100`; e.target.onerror = null; }} />
                    {a.online && <div className="absolute bottom-[1px] right-[1px] w-[9px] h-[9px] rounded-full bg-green-500 border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-primary">
                      <strong>{a.name}</strong> {a.action}
                    </div>
                    <div className="text-[11px] text-text-muted">{new Date(a.time).toLocaleString()}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${a.online ? "bg-green-500" : "bg-slate-200"}`} />
                </div>
              ))}
            </div>

            {/* Upgrade to Premium */}
            <div className="rounded-[20px] p-[22px] relative overflow-hidden" style={{ background: "linear-gradient(135deg, #E91E63 0%, #ff6090 100%)" }}>
              <div className="absolute -top-5 -right-5 w-[100px] h-[100px] rounded-full bg-white/10" />
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} className="text-white" />
                <span className="text-[15px] font-bold text-white">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Unlock all features and get better matches.
              </p>
              {[
                "See who likes you",
                "Unlimited messaging",
                "Advanced search filters",
                "Priority in recommendations",
                "Browse privately",
              ].map(f => (
                <div key={f} className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white/90 font-medium">{f}</span>
                </div>
              ))}
              <Link to="/subscription" className="block text-center mt-4 py-3 text-[13px] font-bold no-underline bg-white hover:bg-pink-50 text-[#E91E63] rounded-xl shadow-sm hover:scale-105 transition-all">
                Upgrade Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
