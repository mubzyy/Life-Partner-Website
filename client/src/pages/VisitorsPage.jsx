import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, Users, Heart, UserPlus, TrendingUp, MapPin, Briefcase,
  ChevronDown, Crown, Star, Zap, Camera, BookOpen, Activity, ArrowRight,
  BarChart2, CheckCircle2, RefreshCw
} from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const ALL_VISITORS = [
  { id: 1, name: "Ayesha Khan",  age: 25, profession: "Doctor",           city: "Lahore, Pakistan",     avatar: "/images/profile_f1.jpg", online: true,  time: "2 minutes ago",  interested: true  },
  { id: 2, name: "Fatima Ali",   age: 26, profession: "Software Engineer", city: "Islamabad, Pakistan",  avatar: "/images/profile_f2.jpg", online: true,  time: "15 minutes ago", interested: false },
  { id: 3, name: "Zainab Malik", age: 24, profession: "Teacher",           city: "Rawalpindi, Pakistan", avatar: "/images/profile_f3.jpg", online: false, time: "1 hour ago",     interested: true  },
  { id: 4, name: "Hira Ahmed",   age: 23, profession: "Pharmacist",        city: "Karachi, Pakistan",    avatar: "/images/profile_f4.jpg", online: true,  time: "2 hours ago",    interested: false },
  { id: 5, name: "Sarah Batool", age: 24, profession: "Content Writer",    city: "Multan, Pakistan",     avatar: "/images/profile_f6.jpg", online: true,  time: "3 hours ago",    interested: false },
  { id: 6, name: "Laiba Zaidi",  age: 26, profession: "Business Analyst",  city: "Lahore, Pakistan",     avatar: "/images/profile_f7.jpg", online: true,  time: "Yesterday",      interested: false },
  { id: 7, name: "Sana Tariq",   age: 25, profession: "UI/UX Designer",    city: "Islamabad, Pakistan",  avatar: "/images/profile_f8.jpg", online: false, time: "Yesterday",      interested: true  },
  { id: 8, name: "Maria Noor",   age: 25, profession: "Graphic Designer",  city: "Faisalabad, Pakistan", avatar: "/images/profile_f5.jpg", online: false, time: "2 days ago",     interested: false },
  { id: 9, name: "Nadia Islam",  age: 27, profession: "Dentist",           city: "Peshawar, Pakistan",   avatar: "/images/profile_f1.jpg", online: true,  time: "3 days ago",     interested: true  },
  { id: 10,name: "Amna Raza",   age: 22, profession: "Student",           city: "Lahore, Pakistan",     avatar: "/images/profile_f3.jpg", online: false, time: "4 days ago",     interested: false },
];

const STATS = [
  { label: "Profile Views",     value: "238", sub: "↑ 18 this week", subColor: "text-green-600", icon: <Eye size={22} className="text-[#E91E63]" />,    iconBg: "bg-pink-50"   },
  { label: "Unique Visitors",   value: "156", sub: "↑ 12 this week", subColor: "text-green-600", icon: <Users size={22} className="text-[#E91E63]" />,  iconBg: "bg-pink-50"   },
  { label: "Interested In You", value: "47",  sub: "↑ 6 this week",  subColor: "text-green-600", icon: <Heart size={22} className="text-[#E91E63]" fill="currentColor" />, iconBg: "bg-pink-50" },
  { label: "New This Week",     value: "21",  sub: "↑ 5 new",        subColor: "text-green-600", icon: <UserPlus size={22} className="text-[#E91E63]" />, iconBg: "bg-pink-50" },
];

const CHART_DATA = [
  { day: "Mon", value: 24 }, { day: "Tue", value: 18 }, { day: "Wed", value: 28 },
  { day: "Thu", value: 32 }, { day: "Fri", value: 35 }, { day: "Sat", value: 42 }, { day: "Sun", value: 59 },
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

  const toggleLike = (id) => setLikedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filteredVisitors = ALL_VISITORS.filter(v => {
    if (activeTab === "interested") return v.interested;
    if (activeTab === "new")        return ["2 minutes ago","15 minutes ago","1 hour ago","2 hours ago","3 hours ago"].includes(v.time);
    return true;
  });

  const visibleVisitors = filteredVisitors.slice(0, visibleCount);
  const maxChart = Math.max(...CHART_DATA.map(d => d.value));

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8 overflow-x-hidden">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-6 items-start">

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
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-slate-50 shadow-sm">
                  <BarChart2 size={15} className="text-slate-500" />
                  <span className="text-[13px] font-medium text-slate-700">All Time</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.label} className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[14px] ${s.iconBg} flex items-center justify-center shrink-0`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500 font-medium mb-0.5">{s.label}</div>
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
                  { id: "all",        label: "All Visitors",      count: ALL_VISITORS.length },
                  { id: "interested", label: "Interested In You", count: ALL_VISITORS.filter(v => v.interested).length },
                  { id: "new",        label: "New This Week",     count: 21 },
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
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-50 shadow-sm">
                  <span className="text-[13px] font-medium text-slate-700">Most Recent</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Visitor List */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              {visibleVisitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                    <Eye size={28} className="text-[#E91E63]" />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-800 mb-2">No visitors yet</h3>
                  <p className="text-[13px] text-slate-500 max-w-xs">Complete your profile and add photos to attract more profile views.</p>
                </div>
              ) : (
                visibleVisitors.map((v, idx) => (
                  <div key={v.id}
                    className={`flex items-center gap-4 px-5 md:px-7 py-4 hover:bg-[#fff9fb] transition-colors ${idx < visibleVisitors.length - 1 ? "border-b border-slate-100" : ""}`}>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img src={v.avatar} alt={v.name}
                        className="w-[54px] h-[54px] rounded-full object-cover border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => navigate(`/profile/${v.id}`)} />
                      {v.online && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[15px] font-bold text-slate-800 cursor-pointer hover:text-[#E91E63] transition-colors" onClick={() => navigate(`/profile/${v.id}`)}>
                          {v.name}, {v.age}
                        </span>
                        <CheckCircle2 size={15} fill="#E91E63" color="white" />
                        {v.interested && (
                          <span className="text-[11px] font-bold text-[#E91E63] bg-[#fff0f5] border border-pink-200 px-2 py-0.5 rounded-full leading-none">
                            Interested
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                          <Briefcase size={13} className="text-slate-400 shrink-0" />
                          {v.profession}
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          {v.city}
                        </div>
                      </div>
                    </div>

                    {/* Time + Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-slate-400 font-medium hidden sm:block whitespace-nowrap">{v.time}</span>
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
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-5">

            {/* Profile Views Overview (Bar Chart) */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 mb-5">Profile Views Overview</h3>
              <div className="flex items-end justify-between gap-1.5 h-[90px] mb-2">
                {CHART_DATA.map((d) => {
                  const pct = (d.value / maxChart) * 100;
                  const isMax = d.value === maxChart;
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
                {CHART_DATA.map(d => (
                  <div key={d.day} className="flex-1 text-center text-[10px] text-slate-400 font-medium">{d.day}</div>
                ))}
              </div>
              <button className="w-full mt-5 flex items-center justify-center gap-2 text-[13px] font-bold text-[#E91E63] border border-pink-200 rounded-xl py-2.5 hover:bg-[#fff0f5] transition-colors cursor-pointer bg-white">
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
              <button className="w-full flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#E91E63] border-t border-slate-100 pt-4 bg-transparent border-x-0 border-b-0 cursor-pointer hover:opacity-80 transition-opacity">
                View Profile Tips <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorsPage;
