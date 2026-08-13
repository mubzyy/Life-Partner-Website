import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, MessageCircle, Bookmark, X, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, Users, Crown } from "lucide-react";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { authFetch } from "../lib/authFetch";
import { photoUrl } from "../lib/photoUrl";

const API_URL = import.meta.env.VITE_API_URL;
const RESULTS_PER_PAGE = 20;

const DEFAULT_FILTERS = {
  minAge: 18,
  maxAge: 40,
  gender: 'Any',
  city: '',
  maritalStatus: '',
  education: '',
  profession: '',
  religion: '',
  sect: ''
};

// These option lists must match the real enum values Complete Profile
// actually writes to user_profiles (server/lib/profileFields.js) — a filter
// whose options don't exist in the data can never match anything real.
const FILTER_OPTIONS = {
  maritalStatus: ["Never Married", "Divorced", "Widowed", "Already Married"],
  education: ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctorate / PhD", "Islamic Education"],
  religion: ["Islam", "Other"],
  sect: ["Sunni", "Shia", "Just Muslim", "Other"],
};

const SearchPage = () => {
  const [queryInput, setQueryInput] = useState("");   // what's typed
  const [query, setQuery] = useState("");              // what was actually searched
  const [heartedCards, setHeartedCards] = useState({});
  const [likedCards, setLikedCards] = useState({});
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const requestIdRef = useRef(0); // guards against out-of-order responses

  const fetchFavorites = async () => {
    try {
      const res = await authFetch(`${API_URL}/api/favorites`);
      if (res.ok) {
        const data = await res.json();
        const map = {};
        data.forEach(item => { map[item.target_profile_id] = true; });
        setHeartedCards(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Real server-side search: filters, text query, and pagination all travel
  // in one request — nothing is fetched-then-filtered-in-React.
  const fetchProfiles = async (targetPage = page, activeFilters = filters, activeQuery = query) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(false);
    try {
      const res = await authFetch(`${API_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeFilters, query: activeQuery, page: targetPage, limit: RESULTS_PER_PAGE })
      });
      if (requestId !== requestIdRef.current) return; // a newer request superseded this one
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
      setPage(data.page);
      setHasNextPage(data.hasNextPage);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error(err);
      setError(true);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchProfiles(1, DEFAULT_FILTERS, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleHeart = async (id) => {
    try {
      const res = await authFetch(`${API_URL}/api/favorites/toggle`, {
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

  const interact = async (id, action) => {
    try {
      const res = await authFetch(`${API_URL}/api/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_id: id, action })
      });
      if (res.ok) {
        if (action === 'like') setLikedCards(h => ({ ...h, [id]: true }));
        else setLikedCards(h => ({ ...h, [id]: false }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runSearch = () => {
    setQuery(queryInput);
    fetchProfiles(1, filters, queryInput);
  };

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
    setFilters(f => {
      const next = key === 'age' ? { ...f, minAge: 18, maxAge: 40 }
        : key === 'gender' ? { ...f, gender: 'Any' }
        : { ...f, [key]: '' };
      fetchProfiles(1, next, query);
      return next;
    });
  };

  const handleApplyFilters = () => {
    fetchProfiles(1, filters, query);
    setShowFilters(false);
  };

  const handleResetAll = () => {
    setFilters(DEFAULT_FILTERS);
    fetchProfiles(1, DEFAULT_FILTERS, query);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1) return;
    fetchProfiles(nextPage, filters, query);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil(total / RESULTS_PER_PAGE));

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
            <span className="text-[13px] text-text-secondary">Showing <strong className="text-text-primary">{total}</strong> {total === 1 ? "match" : "matches"}</span>
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
        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-6 lg:items-start">

          {/* ── LEFT FILTERS PANEL ── */}
          <div className={`bg-card rounded-[20px] p-[22px] border border-border-light lg:sticky top-[92px] w-full min-w-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-text-primary m-0">Filters</h2>
              <button onClick={handleResetAll} className="text-xs text-primary font-bold bg-transparent border-none cursor-pointer hover:text-primary-dark transition-colors">Reset All</button>
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

            {/* Free-text filters — city/profession are free-form fields in
                Complete Profile, so a fixed dropdown can never cover real
                values; ILIKE substring matching on the backend handles it. */}
            {[
              { key: "city", label: "Location", placeholder: "e.g. Lahore" },
              { key: "profession", label: "Profession", placeholder: "e.g. Engineer" },
            ].map(f => (
              <div key={f.key} className="mb-4">
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={filters[f.key]}
                  onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-50 rounded-lg py-2 px-3 border border-border-light text-[13px] text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            ))}

            {/* Enum-backed dropdown filters — options match the real values
                Complete Profile writes (server/lib/profileFields.js). */}
            {[
              { key: "maritalStatus", label: "Marital Status", placeholder: "Select Status" },
              { key: "education",     label: "Education",      placeholder: "Select Education" },
              { key: "religion",      label: "Religion",       placeholder: "Select Religion" },
              { key: "sect",          label: "Sect",           placeholder: "Select Sect" },
            ].map(f => (
              <div key={f.key} className="mb-4 relative">
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">{f.label}</label>
                <div className="relative">
                  <select
                    value={filters[f.key]}
                    onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 rounded-lg py-2 pl-3 pr-8 border border-border-light text-[13px] text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
                  >
                    <option value="">{f.placeholder}</option>
                    {FILTER_OPTIONS[f.key].map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
          </div>

          {/* ── RIGHT: search + results ── */}
          <div className="min-w-0 w-full">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 flex items-center bg-card rounded-xl border border-border-light border-border-light px-4 gap-2.5 focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-primary-light transition-all">
                <Search size={16} className="text-text-muted" />
                <input
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && runSearch()}
                  placeholder="Search by name or profession..."
                  className="flex-1 border-none outline-none text-sm text-slate-700 bg-transparent py-3"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={runSearch} className="flex-1 sm:flex-none px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all font-bold cursor-pointer text-sm">
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
                <button onClick={handleResetAll} className="text-[13px] font-bold text-primary bg-transparent border-none cursor-pointer hover:text-primary-dark transition-colors ml-1">
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

            {/* Profile grid — loading / error / empty are distinct real states,
                never a fallback to fake profiles. */}
            <div className="w-full">
              {loading ? (
                <div className="py-12 bg-card rounded-2xl border border-border-light">
                  <LoadingState message="Searching profiles…" fullHeight={false} />
                </div>
              ) : error ? (
                <div className="py-12 bg-card rounded-2xl border border-border-light">
                  <ErrorState onRetry={() => fetchProfiles(page, filters, query)} showHomeButton={false} />
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 bg-card rounded-2xl border border-border-light text-center">
                  <EmptyState
                    icon={Search}
                    title="No Profiles Found"
                    description="We couldn't find any matches for your current search and filters. Try adjusting your criteria."
                    actionText="Clear Filters"
                    onAction={() => { setQueryInput(""); setQuery(""); handleResetAll(); }}
                  />
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 md:gap-[18px]">
              {results.map((p) => (
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
                    {/* Heart (Favorite) */}
                    <button onClick={() => toggleHeart(p.id)} title="Favorite"
                      className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-card border border-border-light border-border-light cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <Heart size={15} className={heartedCards[p.id] ? "text-rose-600" : "text-text-muted"} fill={heartedCards[p.id] ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="pt-3.5 px-4 pb-4">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-bold text-sm text-text-primary">{p.name}, {p.age}</span>
                      <span className="text-primary text-sm">♡</span>
                      {/* Real premium status — from POST /api/search (isPremium), backed by an active subscriptions row. */}
                      {p.isPremium && <Crown size={13} className="text-[#E91E63]" fill="#E91E63" />}
                    </div>
                    <div className="text-[13px] text-text-secondary mb-1.5">{p.profession}</div>
                    <div className="text-xs text-text-muted mb-0.5 flex items-center gap-1">
                      📍 {p.city}
                    </div>
                    <div className="text-xs text-text-muted mb-3.5 flex items-center gap-1">
                      🎓 {p.edu}
                    </div>

                    {/* Action buttons: Message, Pass, Like, View Profile */}
                    <div className="flex items-center gap-2">
                      <Link to={`/messages`} title="Message" className="w-8 h-8 rounded-full border border-border-light border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
                        <MessageCircle size={14} className="text-text-secondary" />
                      </Link>
                      <button onClick={() => interact(p.id, 'pass')} title="Pass"
                        className="w-8 h-8 rounded-full border border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
                        <X size={14} className="text-text-secondary" />
                      </button>
                      <button onClick={() => interact(p.id, 'like')} title="Like"
                        className={`w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center transition-colors shrink-0 ${likedCards[p.id] ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-border-light bg-card hover:bg-slate-50"}`}>
                        <Heart size={14} className={likedCards[p.id] ? "text-rose-600" : "text-text-secondary"} fill={likedCards[p.id] ? "currentColor" : "none"} />
                      </button>
                      <Link to={`/profile/${p.id}`} className="flex-1 text-center py-1.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all no-underline">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
                </div>

                {/* Pagination — real, server-backed */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 mb-2">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-[13px] font-bold text-text-secondary px-2">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={!hasNextPage}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
