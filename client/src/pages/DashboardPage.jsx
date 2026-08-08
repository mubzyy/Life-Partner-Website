import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart, MessageSquare, Eye, ChevronRight, ChevronLeft,
  Shield, MapPin, GraduationCap, Crown, Check,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────
const stats = [
  { label: "Matches",       value: 12, sub: "↑ 4 new this week",   icon: "👥", color: "currentColor" },
  { label: "Messages",      value: 8,  sub: "↑ 2 unread",          icon: "💬", color: "currentColor" },
  { label: "Profile Views", value: 23, sub: "↑ 6 this week",       icon: "👁️", color: "currentColor" },
  { label: "Who Likes Me",  value: 17, sub: "↑ 3 new",             icon: "❤️", color: "#e11d48" },
];

const matches = [
  { id: 1, name: "Ayesha Khan",  age: 25, profession: "Doctor",           city: "Lahore, Pakistan",    edu: "MBBS · KEMU",                   online: true,  image: "/images/profile_f1.jpg" },
  { id: 2, name: "Fatima Ali",   age: 26, profession: "Software Engineer", city: "Islamabad, Pakistan", edu: "BS Computer Science · FAST",    online: true,  image: "/images/profile_f2.jpg" },
  { id: 3, name: "Zainab Malik", age: 24, profession: "Teacher",           city: "Rawalpindi, Pakistan", edu: "MA English · PUNJAB",           online: true,  image: "/images/profile_f3.jpg" },
  { id: 4, name: "Hira Ahmed",   age: 23, profession: "Pharmacist",        city: "Karachi, Pakistan",   edu: "Doctor of Pharmacy · DOW",       online: true,  image: "/images/profile_f4.jpg" },
];

const recentMessages = [
  { name: "Fatima Ali",   msg: "Assalamualaikum! Thank you for your interest.", time: "10:30 AM", unread: 2, image: "/images/profile_f2.jpg" },
  { name: "Hira Ahmed",   msg: "I would like to know more about you.",          time: "Yesterday", unread: 1, image: "/images/profile_f4.jpg" },
  { name: "Zainab Malik", msg: "That sounds great!",                            time: "Yesterday", unread: 0, image: "/images/profile_f3.jpg" },
];

const recentActivity = [
  { name: "Ayesha Khan",  action: "viewed your profile",  time: "2 minutes ago",  online: true,  image: "/images/profile_f1.jpg" },
  { name: "Fatima Ali",   action: "sent you a message",   time: "15 minutes ago", online: true,  image: "/images/profile_f2.jpg" },
  { name: "Zainab Malik", action: "liked your profile",   time: "1 hour ago",     online: false, image: "/images/profile_f3.jpg" },
  { name: "Hira Ahmed",   action: "favorited you",      time: "2 hours ago",    online: false, image: "/images/profile_f4.jpg" },
  { name: "Sarah Batool", action: "viewed your profile",  time: "3 hours ago",    online: false, image: "/images/profile_f5.jpg" },
];

const visitors = [
  { name: "Ayesha Khan",  city: "Lahore, Pakistan",    time: "2 min ago",   image: "/images/profile_f1.jpg" },
  { name: "Sarah Batool", city: "Faisalabad, Pakistan", time: "3 hours ago", image: "/images/profile_f5.jpg" },
  { name: "Maryam Noor",  city: "Islamabad, Pakistan", time: "5 hours ago", image: "/images/profile_f6.jpg" },
];

const getAvatarBg = (i) => ["bg-[#2d7a6e]", "bg-[#6b4c8a]", "bg-[#2d6e7e]", "bg-[#7a6e2d]", "bg-[#4c6e2d]"][i % 5];
const getAvatarGradient = (i) => ["bg-gradient-to-br from-[#2d7a6e33] to-[#2d7a6e66]", "bg-gradient-to-br from-[#6b4c8a33] to-[#6b4c8a66]", "bg-gradient-to-br from-[#2d6e7e33] to-[#2d6e7e66]", "bg-gradient-to-br from-[#7a6e2d33] to-[#7a6e2d66]", "bg-gradient-to-br from-[#4c6e2d33] to-[#4c6e2d66]"][i % 5];

// Simple sparkline data for activity chart
const chartData = [10, 18, 14, 22, 20, 30, 25, 35, 28, 38, 32, 40, 36, 23];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPage = () => {
  const { user } = useAuth();
  const [heartedCards, setHeartedCards] = useState({});
  const [completion, setCompletion] = useState(25); // Default base completion

  // Calculate actual profile completion
  useEffect(() => {
    if (user?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.message) {
            const keys = Object.keys(data);
            const exclude = ["id", "user_id", "created_at", "updated_at"];
            const relevantKeys = keys.filter(k => !exclude.includes(k));
            const filledKeys = relevantKeys.filter(k => {
              const val = data[k];
              return val !== null && val !== "" && val !== "[]";
            });
            if (relevantKeys.length > 0) {
              setCompletion(Math.round((filledKeys.length / relevantKeys.length) * 100));
            }
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  const toggleHeart = (id) => setHeartedCards(h => ({ ...h, [id]: !h[id] }));

  // SVG sparkline
  const maxVal = Math.max(...chartData);
  const w = 600, h = 120;
  const pts = chartData.map((v, i) => `${(i / (chartData.length - 1)) * w},${h - (v / maxVal) * (h - 10) - 5}`).join(" ");

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background px-4 md:px-6 py-6 md:py-10 overflow-x-hidden">
      <div className="w-full max-w-[1400px] mx-auto">

        {/* ── Main 2-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Welcome banner */}
            <div className="bg-card rounded-[20px] px-7 py-6 border border-border-light  grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="flex items-center gap-4">
                <div className="w-[54px] h-[54px] rounded-full bg-primary flex items-center justify-center text-[22px] font-bold text-white shrink-0">
                  {user?.name?.[0] ?? "A"}
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-text-primary mb-1">
                    Assalamualaikum, {user?.name?.split(" ")[0] || user?.first_name || "Guest"}! 👋
                  </h1>
                  <p className="text-[13px] text-text-secondary m-0">Welcome back! You have 12 new matches today.</p>
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
            <div className="overflow-x-auto pb-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 min-w-[600px] md:min-w-0">
              {stats.map(s => (
                <div key={s.label} className="bg-card rounded-2xl py-[18px] px-5 border border-border-light ">
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

              <div className="overflow-x-auto pb-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 min-w-[800px] md:min-w-0">
                {matches.map((m, i) => (
                  <div key={m.id} className="rounded-2xl border border-border-light  overflow-hidden bg-card hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {/* Photo */}
                    <div className={`h-[140px] relative flex items-center justify-center bg-primary-very-light overflow-hidden`}>
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
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
                        <span className="font-bold text-[13px] text-text-primary">{m.name}, {m.age}</span>
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
              </div>
            </div>

            {/* Bottom 3-column: Messages | Visitors | Chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Recent Messages */}
              <div className="bg-card rounded-2xl p-5 border border-border-light shadow-sm  overflow-x-auto">
                <div className="min-w-[300px] md:min-w-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-bold text-text-primary m-0">Recent Messages</h3>
                  <Link to="/messages" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</Link>
                </div>
                {recentMessages.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3.5">
                    <img src={m.image} alt={m.name} className="w-[38px] h-[38px] rounded-full object-cover shrink-0" />
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
              <div className="bg-card rounded-2xl p-5 border border-border-light shadow-sm  overflow-x-auto">
                <div className="min-w-[300px] md:min-w-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-bold text-text-primary m-0">Profile Visitors</h3>
                  <Link to="/visitors" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</Link>
                </div>
                {visitors.map((v, i) => (
                  <div key={i} className="flex items-center justify-between gap-2.5 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <img src={v.image} alt={v.name} className="w-[38px] h-[38px] rounded-full object-cover shrink-0" />
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
                <a href="#" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</a>
              </div>
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 mb-3.5">
                  <div className="relative shrink-0">
                    <img src={a.image} alt={a.name} className="w-9 h-9 rounded-full object-cover" />
                    {a.online && <div className="absolute bottom-[1px] right-[1px] w-[9px] h-[9px] rounded-full bg-green-500 border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-primary">
                      <strong>{a.name}</strong> {a.action}
                    </div>
                    <div className="text-[11px] text-text-muted">{a.time}</div>
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
