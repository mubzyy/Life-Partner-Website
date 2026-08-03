import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart, MessageSquare, Eye, ChevronRight, ChevronLeft,
  Shield, MapPin, GraduationCap, Crown, Check,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────
const stats = [
  { label: "Matches",       value: 12, sub: "↑ 4 new this week",   icon: "👥", color: "#0f5d52" },
  { label: "Messages",      value: 8,  sub: "↑ 2 unread",          icon: "💬", color: "#0f5d52" },
  { label: "Profile Views", value: 23, sub: "↑ 6 this week",       icon: "👁️", color: "#0f5d52" },
  { label: "Who Likes Me",  value: 17, sub: "↑ 3 new",             icon: "❤️", color: "#e11d48" },
];

const matches = [
  { id: 1, name: "Ayesha Khan",  age: 25, profession: "Doctor",           city: "Lahore, Pakistan",    edu: "MBBS · KEMU",                   online: true  },
  { id: 2, name: "Fatima Ali",   age: 26, profession: "Software Engineer", city: "Islamabad, Pakistan", edu: "BS Computer Science · FAST",    online: true  },
  { id: 3, name: "Zainab Malik", age: 24, profession: "Teacher",           city: "Rawalpindi, Pakistan", edu: "MA English · PUNJAB",           online: true  },
  { id: 4, name: "Hira Ahmed",   age: 23, profession: "Pharmacist",        city: "Karachi, Pakistan",   edu: "Doctor of Pharmacy · DOW",       online: true  },
];

const recentMessages = [
  { name: "Fatima Ali",   msg: "Assalamualaikum! Thank you for your interest.", time: "10:30 AM", unread: 2 },
  { name: "Hira Ahmed",   msg: "I would like to know more about you.",          time: "Yesterday", unread: 1 },
  { name: "Zainab Malik", msg: "That sounds great!",                            time: "Yesterday", unread: 0 },
];

const recentActivity = [
  { name: "Ayesha Khan",  action: "viewed your profile",  time: "2 minutes ago",  online: true  },
  { name: "Fatima Ali",   action: "sent you a message",   time: "15 minutes ago", online: true  },
  { name: "Zainab Malik", action: "liked your profile",   time: "1 hour ago",     online: false },
  { name: "Hira Ahmed",   action: "shortlisted you",      time: "2 hours ago",    online: false },
  { name: "Sarah Batool", action: "viewed your profile",  time: "3 hours ago",    online: false },
];

const visitors = [
  { name: "Ayesha Khan",  city: "Lahore, Pakistan",    time: "2 min ago"   },
  { name: "Sarah Batool", city: "Faisalabad, Pakistan", time: "3 hours ago" },
  { name: "Maryam Noor",  city: "Islamabad, Pakistan", time: "5 hours ago" },
];

const avatarBg = ["#2d7a6e", "#6b4c8a", "#2d6e7e", "#7a6e2d", "#4c6e2d"];

// Simple sparkline data for activity chart
const chartData = [10, 18, 14, 22, 20, 30, 25, 35, 28, 38, 32, 40, 36, 23];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPage = () => {
  const { user } = useAuth();
  const [heartedCards, setHeartedCards] = useState({});

  const toggleHeart = (id) => setHeartedCards(h => ({ ...h, [id]: !h[id] }));

  // SVG sparkline
  const maxVal = Math.max(...chartData);
  const w = 600, h = 120;
  const pts = chartData.map((v, i) => `${(i / (chartData.length - 1)) * w},${h - (v / maxVal) * (h - 10) - 5}`).join(" ");

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f8f6f2] px-4 md:px-6 py-6 md:py-10 overflow-x-hidden">
      <div className="w-full max-w-screen-2xl mx-auto">

        {/* ── Main 2-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }} className="dash-layout">

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>

            {/* Welcome banner */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", border: "1.5px solid #e8ebe9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }} className="welcome-banner">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg, #0f5d52, #1a7a6e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {user?.name?.[0] ?? "A"}
                </div>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a2e2b", margin: "0 0 4px" }}>
                    Assalamualaikum, {user?.name?.split(" ")[0] || user?.first_name || "Guest"}! 👋
                  </h1>
                  <p style={{ fontSize: 13, color: "#6b8a86", margin: 0 }}>Welcome back! You have 12 new matches today.</p>
                </div>
              </div>
              {/* Quran verse */}
              <div style={{ background: "#f0f7f5", borderRadius: 16, padding: "16px 20px", textAlign: "center", borderLeft: "3px solid #0f5d52" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#1a2e2b", margin: "0 0 8px", fontStyle: "italic", direction: "rtl" }}>
                  وَخَلَقَ كُلَّ شَيْءٍ فَقَدَّرَهُ تَقْدِيرًا
                </p>
                <p style={{ fontSize: 11, color: "#6b8a86", margin: 0 }}>
                  "And He created everything and determined it with precision."
                </p>
                <p style={{ fontSize: 11, color: "#0f5d52", fontWeight: 700, margin: "4px 0 0" }}>— Quran 25:2</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="overflow-x-auto pb-4 w-full">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(200px, 1fr))", gap: 16 }} className="stats-grid">
              {stats.map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1.5px solid #e8ebe9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "#edf7f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b8a86", fontWeight: 600 }}>{s.label}</div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#1a2e2b", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#0f5d52", fontWeight: 600, marginTop: 6 }}>{s.sub}</div>
                </div>
              ))}
              </div>
            </div>

            {/* Recommended Matches */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1.5px solid #e8ebe9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>✨</span>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Recommended Matches</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link to="/matches" style={{ fontSize: 13, fontWeight: 700, color: "#0f5d52", textDecoration: "none" }}>View All Matches</Link>
                  <button style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={14} color="#64748b" />
                  </button>
                  <button style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight size={14} color="#64748b" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto pb-4 w-full">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(240px, 1fr))", gap: 16 }} className="match-cards">
                {matches.map((m, i) => (
                  <div key={m.id} style={{ borderRadius: 16, border: "1.5px solid #e8ebe9", overflow: "hidden", background: "#fff" }}>
                    {/* Photo */}
                    <div style={{
                      height: 140,
                      background: `linear-gradient(135deg, ${avatarBg[i % avatarBg.length]}33, ${avatarBg[i % avatarBg.length]}66)`,
                      position: "relative",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: avatarBg[i % avatarBg.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 700 }}>
                        {m.name[0]}
                      </div>
                      {/* Online dot */}
                      {m.online && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "#22c55e", color: "#fff", borderRadius: 6, fontSize: 10, fontWeight: 700, padding: "2px 7px", display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
                          Online
                        </div>
                      )}
                      {/* Heart */}
                      <button onClick={() => toggleHeart(m.id)}
                        style={{ position: "absolute", bottom: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "1.5px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Heart size={14} color={heartedCards[m.id] ? "#e11d48" : "#94a3b8"} fill={heartedCards[m.id] ? "#e11d48" : "none"} />
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "12px 14px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2e2b" }}>{m.name}, {m.age}</span>
                        <span style={{ color: "#0f5d52", fontSize: 12 }}>✓</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b8a86", marginBottom: 6 }}>{m.profession}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
                        <MapPin size={10} /> {m.city}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
                        <GraduationCap size={10} /> {m.edu}
                      </div>
                      <Link to={`/profile/${m.id}`} style={{
                        display: "block", textAlign: "center",
                        background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                        color: "#fff", textDecoration: "none",
                        borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700,
                      }}>
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Bottom 3-column: Messages | Visitors | Chart */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 20 }} className="bottom-grid">

              {/* Recent Messages */}
              <div style={{ background: "#fff", borderRadius: 20, padding: "20px", border: "1.5px solid #e8ebe9" }} className="overflow-x-auto">
                <div className="min-w-[300px]">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Recent Messages</h3>
                  <Link to="/messages" style={{ fontSize: 12, color: "#0f5d52", fontWeight: 700, textDecoration: "none" }}>View All</Link>
                </div>
                {recentMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarBg[i % avatarBg.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                      {m.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2e2b" }}>{m.name}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#6b8a86", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.msg}</div>
                    </div>
                    {m.unread > 0 && (
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#0f5d52", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.unread}</div>
                    )}
                  </div>
                ))}
                  </div>
                </div>

              {/* Profile Visitors */}
              <div style={{ background: "#fff", borderRadius: 20, padding: "20px", border: "1.5px solid #e8ebe9" }} className="overflow-x-auto">
                <div className="min-w-[300px]">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Profile Visitors</h3>
                  <Link to="/visitors" style={{ fontSize: 12, color: "#0f5d52", fontWeight: 700, textDecoration: "none" }}>View All</Link>
                </div>
                {visitors.map((v, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarBg[(i + 2) % avatarBg.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                        {v.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e2b" }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{v.city}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{v.time}</div>
                      <Eye size={14} color="#0f5d52" style={{ marginTop: 4 }} />
                    </div>
                  </div>
                ))}
                  </div>
                </div>

              {/* Activity chart */}
              <div style={{ background: "#fff", borderRadius: 20, padding: "20px", border: "1.5px solid #e8ebe9" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: "0 0 4px" }}>Your Activity Overview</h3>
                <div style={{ width: "100%", overflow: "hidden", marginTop: 16 }}>
                  <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: "100%", height: "auto" }}>
                    {/* Grid lines */}
                    {[0, 10, 20, 30, 40].map(v => (
                      <g key={v}>
                        <line x1="0" y1={h - (v / 40) * (h - 10) - 5} x2={w} y2={h - (v / 40) * (h - 10) - 5} stroke="#f1f5f9" strokeWidth="1" />
                        <text x="0" y={h - (v / 40) * (h - 10) - 5} fontSize="14" fill="#94a3b8">{v}</text>
                      </g>
                    ))}
                    {/* Line */}
                    <polyline points={pts} fill="none" stroke="#0f5d52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Dots */}
                    {chartData.map((v, i) => (
                      <circle key={i} cx={(i / (chartData.length - 1)) * w} cy={h - (v / maxVal) * (h - 10) - 5} r="5" fill="#0f5d52" />
                    ))}
                    {/* Day labels */}
                    {days.map((d, i) => (
                      <text key={d} x={(i / (days.length - 1)) * w} y={h + 18} fontSize="14" fill="#94a3b8" textAnchor="middle">{d}</text>
                    ))}
                  </svg>
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                  {[
                    { color: "#0f5d52", label: "23 Profile Views"  },
                    { color: "#d4a843", label: "12 New Matches"     },
                    { color: "#6b8a86", label: "8 Messages Sent"    },
                    { color: "#e11d48", label: "17 Likes Received"  },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontSize: 11, color: "#6b8a86" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy banner */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1.5px solid #e8ebe9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#edf7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={18} color="#0f5d52" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e2b" }}>Your privacy and security are our top priority</div>
                  <div style={{ fontSize: 12, color: "#6b8a86" }}>We verify every profile manually to ensure a safe and trusted community.</div>
                </div>
              </div>
              <Link to="/settings" style={{ fontSize: 13, fontWeight: 700, color: "#0f5d52", textDecoration: "none", whiteSpace: "nowrap" }}>Learn More →</Link>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* Profile Completion */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px", border: "1.5px solid #e8ebe9" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: "0 0 8px" }}>Profile Completion</h3>
              <p style={{ fontSize: 12, color: "#6b8a86", margin: "0 0 16px" }}>Complete your profile to get better matches</p>
              {/* Ring */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <svg viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e8ebe9" strokeWidth="8" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#0f5d52" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 34 * 0.75} ${2 * Math.PI * 34}`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#1a2e2b" }}>75%</div>
                </div>
              </div>
              <button style={{
                width: "100%", padding: "11px", borderRadius: 10,
                background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                color: "#fff", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700,
              }}>
                Complete Profile
              </button>
            </div>

            {/* Recent Activity */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px", border: "1.5px solid #e8ebe9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Recent Activity</h3>
                <a href="#" style={{ fontSize: 12, color: "#0f5d52", fontWeight: 700, textDecoration: "none" }}>View All</a>
              </div>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarBg[i % avatarBg.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                      {a.name[0]}
                    </div>
                    {a.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#1a2e2b" }}>
                      <strong>{a.name}</strong> {a.action}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.time}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.online ? "#22c55e" : "#e2e8f0", flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* Upgrade to Premium */}
            <div style={{
              background: "linear-gradient(135deg, #0b3d35, #0f5d52)",
              borderRadius: 20,
              padding: "22px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(212,168,67,0.1)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Crown size={18} color="#d4a843" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Upgrade to Premium</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "0 0 16px", lineHeight: 1.5 }}>
                Unlock all features and get better matches.
              </p>
              {[
                "See who likes you",
                "Unlimited messaging",
                "Advanced search filters",
                "Priority in recommendations",
                "Hide your profile & browse privately",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#d4a843", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={10} color="#fff" />
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{f}</span>
                </div>
              ))}
              <Link to="/subscription" style={{
                display: "block", textAlign: "center", marginTop: 16,
                background: "linear-gradient(135deg, #d4a843, #c89832)",
                color: "#fff", textDecoration: "none",
                borderRadius: 10, padding: "12px 0",
                fontSize: 13, fontWeight: 700,
              }}>
                Upgrade Now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .dash-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 800px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .match-cards { grid-template-columns: repeat(2, 1fr) !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
          .welcome-banner { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .match-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
