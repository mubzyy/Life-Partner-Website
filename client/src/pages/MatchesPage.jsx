import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, Eye, Heart, Star, ChevronDown, Filter, CheckCircle2, MapPin, X, Calendar, GraduationCap, Briefcase, Book, Lightbulb, Crown, ChevronLeft, ChevronRight, Check } from "lucide-react";

const MatchesPage = () => {
  const { user } = useAuth();
  
  // Dummy data matching screenshot
  const stats = [
    { label: "Total Matches", value: "24", sub: "↑ 6 new this week", subColor: "text-green-600", icon: <Users size={22} className="text-[#E91E63]" />, iconBg: "bg-pink-50" },
    { label: "High Compatibility", value: "12", sub: "90% and above", subColor: "text-slate-500", icon: <Heart size={22} className="text-[#E91E63]" fill="currentColor" />, iconBg: "bg-pink-50" },
    { label: "Good Compatibility", value: "18", sub: "60% - 89%", subColor: "text-slate-500", icon: <Star size={22} className="text-orange-500" fill="currentColor" />, iconBg: "bg-orange-50" },
    { label: "Viewed You", value: "15", sub: "People interested in you", subColor: "text-slate-500", icon: <Eye size={22} className="text-[#E91E63]" />, iconBg: "bg-pink-50" },
  ];

  const matches = [
    { id: 1, name: "Ayesha Khan", age: 25, match: "92% Match", profession: "Doctor", city: "Lahore, Pakistan", tags: ["Same City", "Similar Values", "Education"], image: "/images/profile_f1.jpg" },
    { id: 2, name: "Fatima Ali", age: 26, match: "89% Match", profession: "Software Engineer", city: "Islamabad, Pakistan", tags: ["Similar Interests", "Education", "Lifestyle"], image: "/images/profile_f2.jpg" },
    { id: 3, name: "Zainab Malik", age: 24, match: "85% Match", profession: "Teacher", city: "Rawalpindi, Pakistan", tags: ["Same City", "Similar Values", "Lifestyle"], image: "/images/profile_f3.jpg" },
    { id: 4, name: "Hira Ahmed", age: 23, match: "85% Match", profession: "Pharmacist", city: "Karachi, Pakistan", tags: ["Similar Interests", "Education", "Values"], image: "/images/profile_f4.jpg" },
    { id: 5, name: "Mariam Noor", age: 25, match: "78% Match", profession: "Graphic Designer", city: "Faisalabad, Pakistan", tags: ["Lifestyle", "Similar Values", "Interests"], image: "/images/profile_f5.jpg" },
    { id: 6, name: "Sarah Batool", age: 24, match: "75% Match", profession: "Content Writer", city: "Multan, Pakistan", tags: ["Education", "Same City", "Values"], image: "/images/profile_f6.jpg" },
    { id: 7, name: "Laiba Zaidi", age: 26, match: "73% Match", profession: "Business Analyst", city: "Lahore, Pakistan", tags: ["Career Focused", "Similar Values", "Lifestyle"], image: "/images/profile_f7.jpg" },
    { id: 8, name: "Sana Tariq", age: 25, match: "70% Match", profession: "UI/UX Designer", city: "Islamabad, Pakistan", tags: ["Interests", "Same City", "Education"], image: "/images/profile_f8.jpg" },
  ];

  const activity = [
    { id: 1, user: "Ayesha Khan", action: "viewed your profile", time: "2 minutes ago", status: "green", image: "/images/profile_f1.jpg" },
    { id: 2, user: "Fatima Ali", action: "sent you a message", time: "15 minutes ago", status: "green", image: "/images/profile_f2.jpg" },
    { id: 3, user: "Zainab Malik", action: "liked your profile", time: "1 hour ago", status: "grey", image: "/images/profile_f3.jpg" },
    { id: 4, user: "Hira Ahmed", action: "favorited you", time: "2 hours ago", status: "grey", image: "/images/profile_f4.jpg" },
    { id: 5, user: "Sarah Batool", action: "viewed your profile", time: "3 hours ago", status: "grey", image: "/images/profile_f6.jpg" },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8 overflow-x-hidden">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          
          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
            
            {/* Header & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
              <div className="flex items-start gap-3">
                <Heart size={32} className="text-[#E91E63] mt-1 shrink-0" strokeWidth={2.5} />
                <div>
                  <h1 className="text-[28px] font-bold text-slate-800 mb-1 leading-none">My Matches</h1>
                  <p className="text-[14px] text-slate-500 m-0">People who are most compatible with you.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-500">Sort by:</span>
                <div className="flex items-center justify-between gap-6 bg-white rounded-lg py-2 px-3 border border-slate-200 cursor-pointer hover:bg-slate-50 shadow-sm">
                  <span className="text-[13px] font-medium text-slate-700">Best Match</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {stats.map(s => (
                <div key={s.label} className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[14px] ${s.iconBg} flex items-center justify-center shrink-0`}>
                      {s.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-slate-500 font-medium mb-0.5">{s.label}</span>
                      <span className="text-[28px] font-bold text-slate-800 leading-none">{s.value}</span>
                    </div>
                  </div>
                  <div className={`text-[12px] font-medium ${s.subColor} mt-1`}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 my-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-[#E91E63] text-white text-[13px] font-bold py-2 px-5 rounded-[12px] shadow-sm">
                  All Matches
                </div>
                {["Age", "Location", "Education", "Profession", "Sect"].map(filter => (
                  <div key={filter} className="bg-white text-slate-600 border border-slate-200 text-[13px] font-medium py-2 px-4 rounded-[12px] flex items-center gap-2 cursor-pointer hover:bg-slate-50 shadow-sm">
                    {filter}
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-[#E91E63] text-[13px] font-bold cursor-pointer bg-transparent border-none hover:opacity-80">
                More Filters
                <Filter size={16} />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {matches.map(m => (
                <div key={m.id} className="bg-white rounded-[20px] border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0 p-3 flex flex-col justify-between">
                    <img src={m.image} alt={m.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    
                    {/* Top Badges */}
                    <div className="relative z-10 flex justify-between items-start w-full">
                      <div className="bg-[#E91E63] text-white text-[11px] font-bold py-1 px-2.5 rounded-full shadow-sm">
                        {m.match}
                      </div>
                      <div className="bg-green-500 text-white rounded-full text-[11px] font-bold py-1 px-2.5 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> Online
                      </div>
                    </div>

                    {/* Floating Heart */}
                    <div className="relative z-10 self-end">
                      <button className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 text-slate-300 transition-colors cursor-pointer">
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-[16px] text-slate-800">{m.name}, {m.age}</span>
                      <CheckCircle2 size={15} className="text-[#E91E63]" fill="#E91E63" color="white" />
                    </div>
                    <div className="text-[13px] text-slate-600 mb-1">{m.profession}</div>
                    <div className="text-[12px] text-slate-400 mb-4 flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {m.city}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                      {m.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-[#E91E63] bg-pink-50 py-1 px-2 rounded-[6px]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${m.id}`} className="flex-1 text-center py-2 text-[13px] font-bold bg-[#E91E63] hover:bg-[#d81557] text-white rounded-[10px] transition-colors no-underline">
                        View Profile
                      </Link>
                      <button className="w-9 h-9 rounded-[10px] border border-slate-200 bg-white flex items-center justify-center shrink-0 hover:bg-pink-50 cursor-pointer transition-colors group">
                        <Heart size={16} className="text-[#E91E63] group-hover:scale-110 transition-transform" fill="currentColor" />
                      </button>
                      <button className="w-9 h-9 rounded-[10px] border border-slate-200 bg-white flex items-center justify-center shrink-0 hover:bg-slate-50 cursor-pointer transition-colors group">
                        <X size={16} className="text-slate-700 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4 mb-2">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 cursor-pointer bg-transparent border-none"><ChevronLeft size={18} /></button>
              <button className="w-8 h-8 rounded-full bg-[#E91E63] text-white font-bold text-[13px] flex items-center justify-center border-none shadow-sm cursor-pointer">1</button>
              <button className="w-8 h-8 rounded-full text-slate-600 font-bold text-[13px] flex items-center justify-center hover:bg-slate-100 border-none cursor-pointer">2</button>
              <button className="w-8 h-8 rounded-full text-slate-600 font-bold text-[13px] flex items-center justify-center hover:bg-slate-100 border-none cursor-pointer">3</button>
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 cursor-pointer bg-transparent border-none"><ChevronRight size={18} /></button>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-6">
            
            {/* Match Preferences */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-slate-800 m-0">Your Match Preferences</h3>
                <button className="text-[13px] font-bold text-[#E91E63] cursor-pointer bg-transparent border-none hover:opacity-80">Edit</button>
              </div>
              
              <div className="flex flex-col gap-4 mb-5">
                {[
                  { icon: <Calendar size={16}/>, label: "Age", value: "22 - 28" },
                  { icon: <MapPin size={16}/>, label: "Location", value: "Pakistan" },
                  { icon: <GraduationCap size={16}/>, label: "Education", value: "Bachelor and above" },
                  { icon: <Briefcase size={16}/>, label: "Profession", value: "Any" },
                  { icon: <Book size={16}/>, label: "Sect", value: "Sunni" },
                ].map(pref => (
                  <div key={pref.label} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="text-slate-800">{pref.icon}</div>
                      {pref.label}
                    </div>
                    <div className="text-slate-800 font-medium">{pref.value}</div>
                  </div>
                ))}
              </div>

              <Link to="/preferences" className="text-[13px] font-bold text-[#E91E63] no-underline hover:opacity-80 flex items-center gap-1.5">
                View all preferences <ChevronRight size={14} />
              </Link>
            </div>

            {/* Match Tips */}
            <div className="bg-pink-50 rounded-[24px] p-6 border border-pink-100">
              <div className="flex items-center gap-2.5 mb-4">
                <h3 className="text-[15px] font-bold text-slate-800 m-0">Match Tips</h3>
              </div>
              <div className="flex gap-4 items-start mb-4">
                <Lightbulb size={24} className="text-[#E91E63] shrink-0 mt-1" />
                <div>
                  <div className="text-[13px] font-bold text-[#E91E63] mb-1">Complete your profile and add photos</div>
                  <div className="text-[12px] text-slate-600">Profiles with complete info get 3x more matches.</div>
                </div>
              </div>
              <Link to="/profile-setup" className="text-[13px] font-bold text-[#E91E63] no-underline hover:opacity-80 flex items-center gap-1.5 pl-10">
                Complete Profile <ChevronRight size={14} />
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-bold text-slate-800 m-0">Recent Activity</h3>
                <Link to="/visitors" className="text-[12px] font-bold text-[#E91E63] no-underline hover:opacity-80">View All</Link>
              </div>

              <div className="flex flex-col gap-5">
                {activity.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-3 group cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={a.image} alt={a.user} className="w-[38px] h-[38px] rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12px] text-slate-700 truncate">
                          <span className="font-bold">{a.user}</span> {a.action}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{a.time}</div>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === 'green' ? 'bg-green-500' : 'bg-slate-200'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Banner */}
            <div className="bg-pink-50 rounded-[24px] p-6 border border-pink-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-[#E91E63]" />
                  <h3 className="text-[16px] font-bold text-slate-800 m-0">Get Better Matches</h3>
                </div>
                
                <div className="flex flex-col gap-3 mb-6">
                  {[
                    "See who likes you",
                    "Advanced matching algorithm",
                    "Priority in recommendations",
                    "Unlimited profile views"
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <div className="w-[16px] h-[16px] rounded-full bg-[#E91E63] flex items-center justify-center shrink-0">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                      <span className="text-[12px] font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/subscription" className="block w-full py-3 text-[14px] font-bold bg-[#E91E63] hover:bg-[#d81557] text-white text-center rounded-[12px] transition-colors no-underline shadow-sm flex items-center justify-center gap-1.5">
                  Upgrade to Premium <ChevronRight size={16} />
                </Link>
              </div>
              
              <Crown size={120} className="absolute -bottom-6 -right-6 text-[#E91E63] opacity-5 -rotate-12 pointer-events-none" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MatchesPage;
