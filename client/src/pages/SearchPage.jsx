import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, MessageCircle, Bookmark, X, ChevronDown, SlidersHorizontal, Users } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { authFetch } from "../lib/authFetch";
import { photoUrl } from "../lib/photoUrl";

const getAvatarBg = (i) => ["bg-[#2d7a6e]", "bg-[#6b4c8a]", "bg-[#2d6e7e]", "bg-[#7a6e2d]", "bg-[#4c6e2d]", "bg-[#7e2d2d]", "bg-[#2d4c7e]", "bg-[#6e2d7a]"][i % 8];
const getAvatarGradient = (i) => ["bg-gradient-to-br from-[#2d7a6e25] to-[#2d7a6e50]", "bg-gradient-to-br from-[#6b4c8a25] to-[#6b4c8a50]", "bg-gradient-to-br from-[#2d6e7e25] to-[#2d6e7e50]", "bg-gradient-to-br from-[#7a6e2d25] to-[#7a6e2d50]", "bg-gradient-to-br from-[#4c6e2d25] to-[#4c6e2d50]", "bg-gradient-to-br from-[#7e2d2d25] to-[#7e2d2d50]", "bg-gradient-to-br from-[#2d4c7e25] to-[#2d4c7e50]", "bg-gradient-to-br from-[#6e2d7a25] to-[#6e2d7a50]"][i % 8];



const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [heartedCards, setHeartedCards] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 40,
    gender: 'Any',
    city: '',
    maritalStatus: '',
    education: '',
    profession: '',
    religion: '',
    sect: ''
  });
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFavorites();
    fetchProfiles();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/favorites`);
      if (res.ok) {
        const data = await res.json();
        const map = {};
        data.forEach(item => {
          map[item.target_profile_id] = true;
        });
        setHeartedCards(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
  
  const filteredProfiles = profiles.filter(p => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.profession.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const getActiveFilters = () => {
    let arr = [];
    if (filters.gender !== 'Any') arr.push({ key: 'gender', val: filters.gender });
    if (filters.minAge !== 18 || filters.maxAge !== 40) arr.push({ key: 'age', val: `${filters.minAge} - ${filters.maxAge} yrs` });
    if (filters.city) arr.push({ key: 'city', val: filters.city });
    if (filters.maritalStatus) arr.push({ key: 'maritalStatus', val: filters.maritalStatus });
    if (filters.education) arr.push({ key: 'education', val: filters.education });
    if (filters.profession) arr.push({ key: 'profession', val: filters.profession });
    if (filters.religion) arr.push({ key: 'religion', val: filters.religion });
    if (filters.sect) arr.push({ key: 'sect', val: filters.sect });
    return arr;
  };
  
  const removeFilter = (key) => {
    if (key === 'age') setFilters(f => ({ ...f, minAge: 18, maxAge: 40 }));
    else if (key === 'gender') setFilters(f => ({ ...f, gender: 'Any' }));
    else setFilters(f => ({ ...f, [key]: '' }));
    // Wait for state to update, then fetch
    setTimeout(fetchProfiles, 0);
  };

  const handleApplyFilters = () => {
    fetchProfiles();
    setShowFilters(false);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background px-4 md:px-6 py-6 md:py-10">
      <div className="w-full max-w-[1920px] 2xl:px-8 mx-auto">

        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-extrabold text-text-primary mb-1 flex items-center gap-2.5">
              Find Your Life Partner <Heart size={22} className="text-rose-600" fill="currentColor" />
            </h1>
            <p className="text-sm text-text-secondary m-0">Discover compatible matches based on your preferences</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <span className="text-[13px] text-text-secondary">Showing <strong className="text-text-primary">{filteredProfiles.length}</strong> matches</span>
            <div className="flex items-center gap-1.5 bg-card rounded-lg py-2 px-3.5 border border-border-light cursor-pointer hover:bg-slate-50 transition-colors lg:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={14} className="text-text-muted" />
              <span className="text-[13px] text-slate-700 font-bold">Filters</span>
            </div>
            <div className="flex items-center gap-1.5 bg-card rounded-lg py-2 px-3.5 border border-border-light cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-[13px] text-slate-700">Sort by: <strong>Recently Joined</strong></span>
              <ChevronDown size={14} className="text-text-muted" />
            </div>
          </div>
        </div>

        {/* ── 2-column layout ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── LEFT FILTERS PANEL ── */}
          <div className={`bg-card rounded-[20px] p-[22px] border border-border-light lg:sticky top-[92px] w-full min-w-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-text-primary m-0">Filters</h2>
              <button onClick={() => {
                setFilters({ minAge: 18, maxAge: 40, gender: 'Any', city: '', maritalStatus: '', education: '', profession: '', religion: '', sect: '' });
                setTimeout(fetchProfiles, 0);
              }} className="text-xs text-primary font-bold bg-transparent border-none cursor-pointer hover:text-primary-dark transition-colors">Reset All</button>
            </div>

            {/* Age Range */}
            <div className="mb-5 pb-5 border-b border-slate-100">
              <div className="flex justify-between mb-2.5">
                <label className="text-[13px] font-bold text-slate-700">Age Range</label>
                <span className="text-xs text-text-secondary">{filters.minAge} - {filters.maxAge} years</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="18" max="60" 
                  value={filters.minAge} 
                  onChange={e => setFilters(f => ({ ...f, minAge: Number(e.target.value) }))} 
                  className="w-full text-center text-sm py-1.5 border border-border-light rounded-md bg-slate-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="number" 
                  min="18" max="60" 
                  value={filters.maxAge} 
                  onChange={e => setFilters(f => ({ ...f, maxAge: Number(e.target.value) }))} 
                  className="w-full text-center text-sm py-1.5 border border-border-light rounded-md bg-slate-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="mb-5 pb-5 border-b border-slate-100">
              <label className="text-[13px] font-bold text-slate-700 block mb-2.5">Gender</label>
              {["Any", "Female", "Male"].map(g => (
                <label key={g} className="flex items-center gap-2 mb-2 cursor-pointer group" onClick={() => setFilters(f => ({ ...f, gender: g }))}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${filters.gender === g ? "border-primary bg-primary" : "border-border-light bg-card group-hover:border-primary-light"}`}>
                    {filters.gender === g && <span className="text-white text-[10px] leading-none">✓</span>}
                  </div>
                  <span className="text-[13px] text-slate-700">{g}</span>
                </label>
              ))}
            </div>

            {/* Dropdown filters */}
            {[
              { key: "city",          label: "Location",       placeholder: "Select City",       options: ["Lahore", "Islamabad", "Rawalpindi", "Karachi", "Faisalabad", "Multan"] },
              { key: "maritalStatus", label: "Marital Status", placeholder: "Select Status",     options: ["Never Married", "Divorced", "Widowed"] },
              { key: "education",     label: "Education",      placeholder: "Select Education",  options: ["BS", "MS", "MBA", "MBBS", "BDS", "MA"] },
              { key: "profession",    label: "Profession",     placeholder: "Select Profession", options: ["Doctor", "Engineer", "Teacher", "Pharmacist", "Designer", "Analyst"] },
              { key: "religion",      label: "Religion",       placeholder: "Select Religion",   options: ["Sunni", "Shia"] },
              { key: "sect",          label: "Sect",           placeholder: "Select Sect",       options: ["Deobandi", "Barelvi", "Ahl-e-Hadith", "Ismaili", "Bohra"] },
            ].map(f => (
              <div key={f.label} className="mb-4 relative">
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">{f.label}</label>
                <div className="relative">
                  <select 
                    value={filters[f.key]}
                    onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 rounded-lg py-2 pl-3 pr-8 border border-border-light text-[13px] text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
                  >
                    <option value="">{f.placeholder}</option>
                    {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown size={14} className="text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ))}

            {/* Apply button */}
            <button onClick={handleApplyFilters} className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all flex items-center justify-center gap-2 mt-2 font-bold cursor-pointer text-sm">
              <SlidersHorizontal size={16} />
              Apply Filters
            </button>

            {/* Advanced filters */}
            <div className="flex items-center gap-1.5 justify-center mt-3.5 cursor-pointer hover:opacity-80 transition-opacity">
              <SlidersHorizontal size={14} className="text-text-muted" />
              <span className="text-[13px] text-text-muted">Advanced Filters</span>
              <ChevronDown size={14} className="text-text-muted" />
            </div>
          </div>

          {/* ── RIGHT: search + results ── */}
          <div className="min-w-0 w-full">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 flex items-center bg-card rounded-xl border border-border-light border-border-light px-4 gap-2.5 focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-primary-light transition-all">
                <Search size={16} className="text-text-muted" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, profession or education..."
                  className="flex-1 border-none outline-none text-sm text-slate-700 bg-transparent py-3"
                />
              </div>
              <div className="flex gap-3">
                <button className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all font-bold cursor-pointer text-sm">
                  Search
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 rounded-xl border border-border-light border-border-light bg-card text-[13px] font-bold text-slate-700 cursor-pointer whitespace-nowrap hover:bg-slate-50 transition-colors">
                  <Bookmark size={14} />
                  Save Search
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {getActiveFilters().map(f => (
                <div key={f.key} className="flex items-center gap-1.5 bg-card rounded-full border border-border-light border-border-light py-1 px-3 text-[13px] text-slate-700 font-medium">
                  {f.val}
                  <button onClick={() => removeFilter(f.key)} className="bg-transparent border-none cursor-pointer text-text-muted flex p-0 hover:text-slate-600 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
              {getActiveFilters().length > 0 && (
                <button onClick={() => {
                  setFilters({ minAge: 18, maxAge: 40, gender: 'Any', city: '', maritalStatus: '', education: '', profession: '', religion: '', sect: '' });
                  setTimeout(fetchProfiles, 0);
                }} className="text-[13px] font-bold text-primary bg-transparent border-none cursor-pointer hover:text-primary-dark transition-colors ml-1">
                  Clear All
                </button>
              )}
            </div>

            {/* Premium members banner */}
            {showPremiumBanner && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-primary-very-light rounded-2xl py-4 px-5 border border-border-light border-[#c8e6e0] mb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border-light border-[#c8e6e0] flex items-center justify-center text-lg shrink-0">
                    👑
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-primary">Premium Members Get Better Matches</div>
                    <div className="text-xs text-text-secondary">Upgrade to Premium to see more matches and connect instantly</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:shrink-0 self-end sm:self-auto">
                  <Link to="/subscription" className="py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all font-bold whitespace-nowrap no-underline">Upgrade Now</Link>
                  <button onClick={() => setShowPremiumBanner(false)} className="bg-transparent border-none cursor-pointer text-text-muted flex hover:text-slate-600 transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Profile grid */}
            <div className="w-full">
              {filteredProfiles.length === 0 ? (
                <div className="py-12 bg-card rounded-2xl border border-border-light text-center">
                  <EmptyState
                    icon={Search}
                    title="No Profiles Found"
                    description="We couldn't find any matches for your current search and filters. Try adjusting your criteria."
                    actionText="Clear Filters"
                    onAction={() => {
                      setQuery("");
                      setFilters({ ageMin: 18, ageMax: 40, gender: 'Any', location: '', maritalStatus: '', education: '', profession: '', height: '', religion: '' });
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 md:gap-[18px]">
              {filteredProfiles.map((p, i) => (
                <div key={p.id} className="bg-card rounded-2xl border border-border-light  overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  {/* Photo */}
                  <div className={`h-[180px] relative flex items-center justify-center bg-primary-very-light overflow-hidden`}>
                    <img
                      src={photoUrl(p.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=e91e63&color=fff&size=200`}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=e91e63&color=fff&size=200`; e.target.onerror = null; }}
                    />
                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      {p.online && (
                        <span className="bg-green-500 text-white rounded-md text-[10px] font-bold py-1 px-1.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-card" /> Online
                        </span>
                      )}
                      <span className="bg-primary text-white rounded-md text-[10px] font-bold py-1 px-1.5 flex items-center gap-1">
                        ✓ Verified
                      </span>
                    </div>
                    {/* Heart */}
                    <button onClick={() => toggleHeart(p.id)}
                      className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-card border border-border-light border-border-light cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <Heart size={15} className={heartedCards[p.id] ? "text-rose-600" : "text-text-muted"} fill={heartedCards[p.id] ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="pt-3.5 px-4 pb-4">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-bold text-sm text-text-primary">{p.name}, {p.age}</span>
                      <span className="text-primary text-sm">♡</span>
                    </div>
                    <div className="text-[13px] text-text-secondary mb-1.5">{p.profession}</div>
                    <div className="text-xs text-text-muted mb-0.5 flex items-center gap-1">
                      📍 {p.city}
                    </div>
                    <div className="text-xs text-text-muted mb-3.5 flex items-center gap-1">
                      🎓 {p.edu}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full border border-border-light border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
                        <MessageCircle size={14} className="text-text-secondary" />
                      </button>
                      <button className="w-8 h-8 rounded-full border border-border-light border-red-300 bg-red-50 cursor-pointer flex items-center justify-center hover:bg-red-100 transition-colors shrink-0">
                        <Heart size={14} className="text-rose-600" fill="currentColor" />
                      </button>
                      <Link to={`/profile/${p.id}`} className="flex-1 text-center py-1.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all no-underline">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
