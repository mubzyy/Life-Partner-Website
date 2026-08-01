import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, MessageCircle, Bookmark, X, ChevronDown, SlidersHorizontal } from "lucide-react";

const allProfiles = [
  { id: 1,  name: "Ayesha Khan",   age: 25, profession: "Doctor",            city: "Lahore, Pakistan",    edu: "MBBS · King Edward Medical University",  online: true  },
  { id: 2,  name: "Fatima Ali",    age: 26, profession: "Software Engineer",  city: "Islamabad, Pakistan", edu: "BS Computer Science · FAST",              online: true  },
  { id: 3,  name: "Zainab Malik",  age: 24, profession: "Teacher",            city: "Rawalpindi, Pakistan",edu: "MA English · Punjab University",          online: true  },
  { id: 4,  name: "Hira Ahmed",    age: 23, profession: "Pharmacist",         city: "Karachi, Pakistan",   edu: "Doctor of Pharmacy · DOW",                online: true  },
  { id: 5,  name: "Maryam Noor",   age: 25, profession: "Graphic Designer",   city: "Lahore, Pakistan",    edu: "BS Design · LUMS",                        online: false },
  { id: 6,  name: "Sana Batool",   age: 27, profession: "Business Analyst",   city: "Faisalabad, Pakistan",edu: "MBA · Comsats University",                online: false },
  { id: 7,  name: "Iqra Saleem",   age: 24, profession: "Dentist",            city: "Multan, Pakistan",    edu: "BDS · Nishtar Institute",                 online: false },
  { id: 8,  name: "Areeba Hassan", age: 26, profession: "Interior Designer",  city: "Islamabad, Pakistan", edu: "BS Interior Design · NCA",                online: false },
];

const avatarBg = ["#2d7a6e", "#6b4c8a", "#2d6e7e", "#7a6e2d", "#4c6e2d", "#7e2d2d", "#2d4c7e", "#6e2d7a"];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [heartedCards, setHeartedCards] = useState({});
  const [activeFilters, setActiveFilters] = useState(["Female", "22 - 32 years", "Lahore", "Never Married", "Sunni"]);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);

  const toggleHeart = id => setHeartedCards(h => ({ ...h, [id]: !h[id] }));
  const removeFilter = f => setActiveFilters(arr => arr.filter(a => a !== f));

  const filteredProfiles = allProfiles.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.profession.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f8f6f2] px-4 md:px-6 py-6 md:py-10 overflow-x-hidden">
      <div className="w-full max-w-screen-2xl mx-auto">

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a2e2b", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}>
              Find Your Life Partner <Heart size={22} color="#e11d48" fill="#e11d48" />
            </h1>
            <p style={{ fontSize: 14, color: "#6b8a86", margin: 0 }}>Discover compatible matches based on your preferences</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "#6b8a86" }}>Showing <strong style={{ color: "#1a2e2b" }}>1,248</strong> matches</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1.5px solid #e2e8f0", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: "#334155" }}>Sort by: <strong>Recently Joined</strong></span>
              <ChevronDown size={14} color="#64748b" />
            </div>
          </div>
        </div>

        {/* ── 2-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }} className="search-layout">

          {/* ── LEFT FILTERS PANEL ── */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "22px", border: "1.5px solid #e8ebe9", position: "sticky", top: 92, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Filters</h2>
              <button style={{ fontSize: 12, color: "#0f5d52", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Reset All</button>
            </div>

            {/* Age Range */}
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Age Range</label>
                <span style={{ fontSize: 12, color: "#6b8a86" }}>22 - 32 years</span>
              </div>
              <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, position: "relative", marginBottom: 4 }}>
                <div style={{ position: "absolute", left: "15%", right: "35%", top: 0, height: "100%", background: "#0f5d52", borderRadius: 999 }} />
                <div style={{ position: "absolute", left: "15%", top: "50%", transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "#0f5d52", border: "3px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", cursor: "pointer" }} />
                <div style={{ position: "absolute", right: "35%", top: "50%", transform: "translate(50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "#0f5d52", border: "3px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", cursor: "pointer" }} />
              </div>
            </div>

            {/* Gender */}
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 10 }}>Gender</label>
              {["Female", "Male"].map(g => (
                <label key={g} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: `2px solid ${g === "Female" ? "#0f5d52" : "#e2e8f0"}`,
                    background: g === "Female" ? "#0f5d52" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {g === "Female" && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: "#334155" }}>{g}</span>
                </label>
              ))}
            </div>

            {/* Dropdown filters */}
            {[
              { label: "Location",       placeholder: "Select City"        },
              { label: "Marital Status", placeholder: "Select Status"      },
              { label: "Education",      placeholder: "Select Education"   },
              { label: "Profession",     placeholder: "Select Profession"  },
              { label: "Height",         placeholder: "Select Range"       },
              { label: "Religion",       placeholder: "Select Religion"    },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>{f.label}</label>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: 10, padding: "9px 12px", border: "1.5px solid #e2e8f0", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{f.placeholder}</span>
                  <ChevronDown size={14} color="#94a3b8" />
                </div>
              </div>
            ))}

            {/* Apply button */}
            <button style={{
              width: "100%", padding: "12px",
              background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 8,
            }}>
              <SlidersHorizontal size={16} />
              Apply Filters
            </button>

            {/* Advanced filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 14, cursor: "pointer" }}>
              <SlidersHorizontal size={14} color="#64748b" />
              <span style={{ fontSize: 13, color: "#64748b" }}>Advanced Filters</span>
              <ChevronDown size={14} color="#64748b" />
            </div>
          </div>

          {/* ── RIGHT: search + results ── */}
          <div style={{ minWidth: 0 }}>
            {/* Search bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#fff", borderRadius: 12, border: "1.5px solid #e2e8f0", padding: "0 16px", gap: 10 }}>
                <Search size={16} color="#94a3b8" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, profession or education..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#334155", background: "transparent", padding: "12px 0" }}
                />
              </div>
              <button style={{
                padding: "0 24px", borderRadius: 12,
                background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                color: "#fff", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700, whiteSpace: "nowrap",
              }}>
                Search
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 18px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", background: "#fff",
                fontSize: 13, fontWeight: 700, color: "#334155", cursor: "pointer", whiteSpace: "nowrap",
              }}>
                <Bookmark size={14} />
                Save Search
              </button>
            </div>

            {/* Active filter chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
              {activeFilters.map(f => (
                <div key={f} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#fff", borderRadius: 999,
                  border: "1.5px solid #e2e8f0", padding: "5px 12px",
                  fontSize: 13, color: "#334155", fontWeight: 600,
                }}>
                  {f}
                  <button onClick={() => removeFilter(f)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} style={{ fontSize: 13, fontWeight: 700, color: "#0f5d52", background: "none", border: "none", cursor: "pointer" }}>
                  Clear All
                </button>
              )}
            </div>

            {/* Premium members banner */}
            {showPremiumBanner && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#edf7f5", borderRadius: 16, padding: "16px 20px",
                border: "1.5px solid #c8e6e0", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: "1.5px solid #c8e6e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    👑
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e2b" }}>Premium Members Get Better Matches</div>
                    <div style={{ fontSize: 12, color: "#6b8a86" }}>Upgrade to Premium to see more matches and connect instantly</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Link to="/subscription" style={{
                    padding: "9px 18px", borderRadius: 10,
                    background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                    color: "#fff", textDecoration: "none",
                    fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                  }}>Upgrade Now</Link>
                  <button onClick={() => setShowPremiumBanner(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Profile grid — 4 columns */}
            <div className="overflow-x-auto pb-4 w-full">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(240px, 1fr))", gap: 18 }} className="search-results-grid">
              {filteredProfiles.map((p, i) => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e8ebe9", overflow: "hidden", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(15,93,82,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Photo */}
                  <div style={{
                    height: 180,
                    background: `linear-gradient(135deg, ${avatarBg[i % avatarBg.length]}25, ${avatarBg[i % avatarBg.length]}50)`,
                    position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 70, height: 70, borderRadius: "50%", background: avatarBg[i % avatarBg.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", fontWeight: 700 }}>
                      {p.name[0]}
                    </div>
                    {/* Badges */}
                    <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                      {p.online && (
                        <span style={{ background: "#22c55e", color: "#fff", borderRadius: 6, fontSize: 10, fontWeight: 700, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} /> Online
                        </span>
                      )}
                      <span style={{ background: "#0f5d52", color: "#fff", borderRadius: 6, fontSize: 10, fontWeight: 700, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3 }}>
                        ✓ Verified
                      </span>
                    </div>
                    {/* Heart */}
                    <button onClick={() => toggleHeart(p.id)}
                      style={{ position: "absolute", bottom: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "1.5px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Heart size={15} color={heartedCards[p.id] ? "#e11d48" : "#94a3b8"} fill={heartedCards[p.id] ? "#e11d48" : "none"} />
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1a2e2b" }}>{p.name}, {p.age}</span>
                      <span style={{ color: "#d4a843", fontSize: 14 }}>♡</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#6b8a86", marginBottom: 6 }}>{p.profession}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      📍 {p.city}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
                      🎓 {p.edu}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MessageCircle size={14} color="#6b8a86" />
                      </button>
                      <button style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #fca5a5", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Heart size={14} color="#e11d48" fill="#e11d48" />
                      </button>
                      <Link to={`/profile/${p.id}`} style={{
                        flex: 1, textAlign: "center",
                        background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                        color: "#fff", textDecoration: "none",
                        borderRadius: 8, padding: "7px 0",
                        fontSize: 12, fontWeight: 700,
                      }}>
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .search-layout { grid-template-columns: 1fr !important; }
          .search-results-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .search-results-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .search-results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default SearchPage;
