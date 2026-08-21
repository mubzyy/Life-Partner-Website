import { useState, useEffect, useCallback } from "react";
import { MdSearch, MdLocationOn } from "react-icons/md";
import Avatar from "../components/ui/Avatar";
import Pagination from "../components/ui/Pagination";
import { adminFetch } from "../lib/adminFetch";

const API_URL = import.meta.env.VITE_API_URL;
const PER_PAGE = 12;

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: PER_PAGE });
    if (search) params.set("search", search);
    adminFetch(`${API_URL}/api/admin/profiles?${params}`)
      .then(res => res.json())
      .then(data => { setProfiles(data.results || []); setTotal(data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h2>Profiles</h2><p>{total.toLocaleString()} profiles with Complete Profile data</p></div>
      </div>

      <div className="table-toolbar" style={{ background: "var(--white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--card-border)", marginBottom: 14 }}>
        <div className="search-input-wrap" style={{ maxWidth: 320 }}>
          <span className="search-icon"><MdSearch /></span>
          <input type="text" placeholder="Search profiles..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading…</p></div>
      ) : profiles.length === 0 ? (
        <div className="table-card"><div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No profiles found</h3></div></div>
      ) : (
        <div className="profiles-grid">
          {profiles.map(p => (
            <div key={p.id} className="profile-card">
              <div className="profile-card-avatar">
                <Avatar initials={p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} color="#2d8a4e" size="lg" img={p.image ? `${API_URL}${p.image}` : null} />
              </div>
              <h3>{p.name}{p.age !== "N/A" ? `, ${p.age}` : ""}</h3>
              <div className="profile-card-loc"><MdLocationOn size={12} /> {p.city}</div>
              <div className="profile-card-details">
                <div className="profile-detail-item"><strong>{p.education}</strong>Education</div>
                <div className="profile-detail-item"><strong>{p.profession}</strong>Profession</div>
                <div className="profile-detail-item"><strong>{p.religion}</strong>Religion</div>
                <div className="profile-detail-item"><strong>{p.maritalStatus}</strong>Status</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 6, borderRadius: 999, background: "var(--border-light)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.profileComplete}%`, background: p.profileComplete >= 80 ? "var(--positive)" : p.profileComplete >= 40 ? "var(--warning)" : "var(--negative)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{p.profileComplete}% complete</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Pagination total={total} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>
    </div>
  );
}
