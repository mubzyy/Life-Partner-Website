import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, Users, Heart, UserPlus, TrendingUp, MapPin, Briefcase,
  ChevronDown, Crown, Star, Zap, Camera, BookOpen, Activity, ArrowRight,
  BarChart2, CheckCircle2, RefreshCw
} from "lucide-react";
import EmptyState from "../components/EmptyState";
import SimpleDropdown from "../components/SimpleDropdown";
import { authFetch } from "../lib/authFetch";
import { photoUrl } from "../lib/photoUrl";

const PERIOD_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
];

const BOOST_TIPS = [
  { icon: <Zap size={16} className="text-[#E91E63]" />,   title: "Increase Profile Visibility", desc: "Reach more potential matches" },
  { icon: <Eye size={16} className="text-[#E91E63]" />,   title: "Get More Profile Views",      desc: "Attract compatible matches"  },
  { icon: <Star size={16} className="text-[#E91E63]" />,  title: "Stand Out from Others",       desc: "Highlight your best qualities" },
];

const VIEW_TIPS = [
  { icon: <CheckCircle2 size={15} className="text-[#E91E63]" fill="#E91E63" color="white" />, title: "Complete your profile 100%",    desc: "Profiles with complete info get 3x more views" },
  { icon: <Camera size={15} className="text-[#E91E63]" />,                                    title: "Add clear and recent photos",   desc: "Profiles with photos get 8x more views"        },
  { icon: <BookOpen size={15} className="text-[#E91E63]" />,                                  title: "Write a detailed bio",          desc: "Detailed bios get more attention"              },
  { icon: <Activity size={15} className="text-[#E91E63]" />,                                  title: "Active users get more visibility", desc: "Regular activity increases your reach"      },
];

// ── Page Component ─────────────────────────────────────────────────────────────
const VisitorsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [likedIds, setLikedIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(7);
  const [period, setPeriod] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState([
    { label: "Profile Views",     value: "0", sub: "0 this week", subColor: "text-green-600", icon: <Eye size={22} className="text-[#E91E63]" />,    iconBg: "bg-pink-50"   },
    { label: "Unique Visitors",   value: "0", sub: "0 this week", subColor: "text-green-600", icon: <Users size={22} className="text-[#E91E63]" />,  iconBg: "bg-pink-50"   },
  ]);
  const [chartData, setChartData] = useState([
    { day: "Mon", value: 0 }, { day: "Tue", value: 0 }, { day: "Wed", value: 0 },
    { day: "Thu", value: 0 }, { day: "Fri", value: 0 }, { day: "Sat", value: 0 }, { day: "Sun", value: 0 },
  ]);

  useEffect(() => {
    fetchVisitors();
    fetchStats();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/visitors`);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/visitors/stats`);
      if (res.ok) {
        const data = await res.json();
        // Merge the backend stats with the icons
        const newStats = data.stats.map(s => {
          if (s.label === "Profile Views") {
            return { ...s, icon: <Eye size={22} className="text-[#E91E63]" /> };
          } else if (s.label === "Unique Visitors") {
            return { ...s, icon: <Users size={22} className="text-[#E91E63]" /> };
          }
          return s;
        });
        setStats(newStats);
        setChartData(data.chartData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (id) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: id, action: 'like' })
      });
      if (res.ok) {
        setLikedIds(prev => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const now = Date.now();
  const withinPeriod = (v) => {
    if (period === "all") return true;
    const days = period === "7d" ? 7 : 30;
    return now - new Date(v.time).getTime() <= days * 24 * 60 * 60 * 1000;
  };

  const filteredVisitors = visitors
    .filter(withinPeriod)
    .filter(v => activeTab === "new" ? (now - new Date(v.time).getTime() <= 7 * 24 * 60 * 60 * 1000) : true)
    .sort((a, b) => sortOrder === "recent"
      ? new Date(b.time) - new Date(a.time)
      : new Date(a.time) - new Date(b.time));

  const newThisWeekCount = visitors.filter(v => now - new Date(v.time).getTime() <= 7 * 24 * 60 * 60 * 1000).length;

  const visibleVisitors = filteredVisitors.slice(0, visibleCount);
  const maxChart = Math.max(...chartData.map(d => d.value), 10); // Ensure maxChart is at least 10 to avoid division by zero


  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8">
      <div className="w-full max-w-[1920px] 2xl:px-8 mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

          {/* ── MAIN COLUMN ─────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Eye size={20} className="text-[#E91E63]" />
                </div>
                <div>
                  <h1 className="text-[26px] font-bold text-slate-800 mb-1 leading-none">Who Viewed Me</h1>
                  <p className="text-[13px] text-slate-500 m-0">People who viewed your profile and showed interest in you.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SimpleDropdown icon={BarChart2} options={PERIOD_OPTIONS} value={period} onChange={(v) => { setPeriod(v); setVisibleCount(7); }} />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(s => (
                <div key={s.label} className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[14px] ${s.iconBg} flex items-center justify-center shrink-0`}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] text-slate-500 font-medium mb-0.5 break-words">{s.label}</div>
                      <div className="text-[28px] font-extrabold text-slate-800 leading-none">{s.value}</div>
                    </div>
                  </div>
                  <div className={`text-[12px] font-semibold ${s.subColor}`}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Tabs + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-0 border-b border-slate-200 overflow-x-auto no-scrollbar">
                {[
                  { id: "all",        label: "All Visitors",      count: visitors.length },
                  { id: "new",        label: "New This Week",     count: newThisWeekCount },
                ].map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setVisibleCount(7); }}
                    className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer bg-transparent
                      ${activeTab === tab.id ? "border-[#E91E63] text-[#E91E63]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                    {tab.label}
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-pink-100 text-[#E91E63]" : "bg-slate-100 text-slate-500"}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[13px] text-slate-500">Sort by:</span>
                <SimpleDropdown options={SORT_OPTIONS} value={sortOrder} onChange={setSortOrder} />
              </div>
            </div>

            {/* Visitor List */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              {visibleVisitors.length === 0 ? (
                <EmptyState
                  icon={Eye}
                  title="No visitors yet"
                  description="Complete your profile and add photos to attract more profile views."
                  actionText="Update Profile"
                  actionLink="/profile/me"
                />
              ) : (
                visibleVisitors.map((v, idx) => (
                  <div key={v.id}
                    className={`flex items-center gap-4 px-5 md:px-7 py-4 hover:bg-[#fff9fb] transition-colors ${idx < visibleVisitors.length - 1 ? "border-b border-slate-100" : ""}`}>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img src={photoUrl(v.image) || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt={v.name}
                        className="w-[54px] h-[54px] rounded-full object-cover border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => navigate(`/profile/${v.id}`)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[15px] font-bold text-slate-800 cursor-pointer hover:text-[#E91E63] transition-colors" onClick={() => navigate(`/profile/${v.id}`)}>
                          {v.name}
                        </span>
                        <CheckCircle2 size={15} fill="#E91E63" color="white" />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          {v.city}
                        </div>
                      </div>
                    </div>

                    {/* Time + Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-slate-400 font-medium hidden sm:block whitespace-nowrap">{new Date(v.time).toLocaleDateString()}</span>
                      <Link to={`/profile/${v.id}`}
                        className="text-[13px] font-bold text-[#E91E63] bg-[#fff0f5] hover:bg-pink-100 border border-pink-200 px-4 py-2 rounded-xl no-underline transition-colors whitespace-nowrap">
                        View Profile
                      </Link>
                      <button
                        onClick={() => toggleLike(v.id)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all
                          ${likedIds.has(v.id)
                            ? "bg-[#E91E63] border-[#E91E63] text-white"
                            : "bg-white border-slate-200 text-slate-400 hover:border-[#E91E63] hover:text-[#E91E63]"}`}>
                        <Heart size={16} fill={likedIds.has(v.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Load More */}
              {visibleCount < filteredVisitors.length && (
                <div className="flex justify-center py-5 border-t border-slate-100">
                  <button
                    onClick={() => setVisibleCount(c => c + 5)}
                    className="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-[#E91E63] bg-transparent border-none cursor-pointer transition-colors">
                    Load More <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ────────────────────────────────────────────────── */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">

            {/* Profile Views Overview (Bar Chart) */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 mb-5">Profile Views Overview</h3>
              <div className="flex items-end justify-between gap-1.5 h-[90px] mb-2">
                {chartData.map((d) => {
                  const pct = (d.value / maxChart) * 100;
                  const isMax = d.value === maxChart && d.value > 0;
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-[10px] font-bold text-slate-500">{d.value}</span>
                      <div className="w-full rounded-t-[6px] transition-all duration-300"
                        style={{
                          height: `${pct}%`,
                          minHeight: 6,
                          background: isMax ? "#E91E63" : "#fbc8da",
                        }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-1">
                {chartData.map(d => (
                  <div key={d.day} className="flex-1 text-center text-[10px] text-slate-400 font-medium">{d.day}</div>
                ))}
              </div>
              <button onClick={() => navigate("/dashboard")} className="w-full mt-5 flex items-center justify-center gap-2 text-[13px] font-bold text-[#E91E63] border border-pink-200 rounded-xl py-2.5 hover:bg-[#fff0f5] transition-colors cursor-pointer bg-white">
                <TrendingUp size={15} /> View Analytics
              </button>
            </div>

            {/* Boost Your Profile */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 mb-1">Boost Your Profile</h3>
              <p className="text-[12px] text-slate-500 mb-5 m-0">Get more views and find your perfect match faster!</p>
              <div className="flex flex-col gap-4 mb-5">
                {BOOST_TIPS.map(t => (
                  <div key={t.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center shrink-0">{t.icon}</div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800 leading-snug">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/subscription"
                className="flex items-center justify-center gap-2 w-full py-3 text-[13px] font-bold bg-[#E91E63] hover:bg-[#d81557] text-white rounded-[12px] no-underline transition-colors shadow-sm">
                <Crown size={16} /> Upgrade to Premium
              </Link>
            </div>

            {/* Tips to Get More Views */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 mb-5">Tips to Get More Views</h3>
              <div className="flex flex-col gap-4 mb-5">
                {VIEW_TIPS.map(t => (
                  <div key={t.title} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{t.icon}</div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-800 leading-snug">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/profile-setup")} className="w-full flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#E91E63] border-t border-slate-100 pt-4 bg-transparent border-x-0 border-b-0 cursor-pointer hover:opacity-80 transition-opacity">
                Act on These Tips <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorsPage;
