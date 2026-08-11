import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Lock, MessageCircle, ChevronLeft, ChevronRight, Shield, Eye } from "lucide-react";
import { authFetch } from "../lib/authFetch";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { photoUrl } from "../lib/photoUrl";

const API_URL = import.meta.env.VITE_API_URL;

const navTabs = [
  "About",
  "Personal Information",
  "Education & Career",
  "Family Details",
  "Religious Information",
  "Lifestyle",
];

const getAvatarGradient = (i) => ["bg-gradient-to-br from-[#2d7a6e30] to-[#2d7a6e60]", "bg-gradient-to-br from-[#6b4c8a30] to-[#6b4c8a60]", "bg-gradient-to-br from-[#2d6e7e30] to-[#2d6e7e60]", "bg-gradient-to-br from-[#7a6e2d30] to-[#7a6e2d60]", "bg-gradient-to-br from-[#4c6e2d30] to-[#4c6e2d60]", "bg-gradient-to-br from-[#7e2d2d30] to-[#7e2d2d60]"][i % 6];

// Turns real fetched fields into the label→value maps the info sections
// render — entries with no data are simply omitted instead of showing a
// fabricated placeholder value.
const buildInfoSections = (profile) => {
  const education = {};
  if (profile.education) education["Education"] = profile.education;
  if (profile.occupation) education["Profession"] = profile.occupation;
  if (profile.annual_income) education["Annual Income"] = profile.annual_income;

  const religious = {};
  if (profile.religion) religious["Religion"] = profile.religion;
  if (profile.sect) religious["Sect"] = profile.sect;
  if (profile.prayer_frequency) religious["Prayer Frequency"] = profile.prayer_frequency;
  if (profile.religious_preference) religious["Appearance"] = profile.religious_preference;

  const family = {};
  if (profile.father_occupation) family["Father's Occupation"] = profile.father_occupation;
  if (profile.mother_occupation) family["Mother's Occupation"] = profile.mother_occupation;
  if (profile.siblings_count !== null && profile.siblings_count !== undefined) family["Siblings"] = String(profile.siblings_count);
  if (profile.family_type) family["Family Type"] = profile.family_type;
  if (profile.family_values) family["Family Values"] = profile.family_values;

  const lifestyle = {};
  if (profile.dietary_preference) lifestyle["Diet"] = profile.dietary_preference;
  if (profile.smoking) lifestyle["Smoke"] = profile.smoking;
  if (profile.drinking) lifestyle["Drink"] = profile.drinking;

  return { education, religious, family, lifestyle };
};

const InfoSection = ({ title, icon, data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="bg-background rounded-2xl py-5 px-6 border-[1.5px] border-border-light">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary mb-4">
        <span className="text-lg">{icon}</span> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:gap-2 min-w-0">
            <span className="text-[13px] text-text-muted sm:min-w-[120px] font-semibold shrink-0">{k}</span>
            <span className="text-[13px] text-text-primary font-semibold break-words">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("About");
  const [isFavorited, setIsFavorited] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [similarProfiles, setSimilarProfiles] = useState([]);

  const loadProfile = () => {
    setLoading(true);
    setError(false);
    fetch(`${API_URL}/api/profile/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    authFetch(`${API_URL}/api/favorites`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(f => String(f.target_profile_id) === String(id));
          setIsFavorited(!!found);
        }
      })
      .catch(console.error);

    // Other real members to browse — same source the Dashboard uses.
    authFetch(`${API_URL}/api/matches`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSimilarProfiles(data.filter(p => String(p.id) !== String(id)).slice(0, 6));
        }
      })
      .catch(console.error);
  }, [id]);

  const toggleFavorite = async () => {
    const targetId = parseInt(id);
    if (!targetId) return;
    try {
      const res = await authFetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_profile_id: targetId })
      });
      if (res.ok) {
        setIsFavorited(v => !v);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-background">
        <LoadingState message="Loading profile…" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-background">
        <ErrorState onRetry={loadProfile} message="We couldn't find this profile." />
      </div>
    );
  }

  const name = profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : "Member";
  const age = profile.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;
  const location = [profile.city, profile.state].filter(Boolean).join(", ") || profile.country_name || "Location not specified";
  const attributes = [profile.marital_status, profile.sect, profile.height, profile.nationality_name || profile.nationality]
    .filter(Boolean);
  const about = profile.about_me || "This member hasn't written an introduction yet.";
  const lookingFor = profile.partner_about || "This member hasn't described what they're looking for yet.";
  const sections = buildInfoSections(profile);
  const primaryPhoto = photoUrl(profile.profile_photo_url);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background px-4 md:px-6 py-6 md:py-12">
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-text-secondary text-[13px] font-semibold mb-5 p-0 hover:text-text-secondary transition-colors">
          <ArrowLeft size={16} /> Back to Search Results
        </button>

        {/* ── 2-column layout ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT MAIN ── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* Hero banner */}
            <div className="bg-card rounded-[20px] overflow-hidden border-[1.5px] border-border-light min-w-0">
              <div className="bg-gradient-to-br from-[#2d7a6e44] to-[#6b8a8622] p-7 flex flex-col md:grid md:grid-cols-[auto_1fr] gap-6 items-center md:items-start text-center md:text-left justify-items-center md:justify-items-start">
                {/* Profile photo */}
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-none md:w-auto mx-auto md:mx-0">
                  <div className="w-full aspect-[4/5] md:w-[160px] md:h-[200px] md:aspect-auto rounded-2xl overflow-hidden shadow-sm bg-primary-very-light flex items-center justify-center text-4xl font-bold text-primary">
                    {primaryPhoto ? (
                      <img src={primaryPhoto} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Name + info */}
                <div className="flex flex-col md:block items-center w-full min-w-0">
                  <h1 className="text-[28px] font-extrabold text-text-primary mb-1 flex flex-wrap justify-center md:justify-start items-center gap-2 text-center md:text-left break-words">
                    {name}{age ? `, ${age}` : ""}
                  </h1>
                  <p className="text-[15px] text-text-secondary mb-2.5">{profile.occupation || "Occupation not specified"}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-1 text-[13px] text-text-secondary">
                      <MapPin size={14} /> {location}
                    </span>
                  </div>

                  {/* Attribute chips */}
                  {attributes.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-5 justify-center md:justify-start">
                      {attributes.map(a => (
                        <span key={a} className="bg-card/80 rounded-lg py-1 px-3 text-xs font-semibold text-text-primary border border-border-light">{a}</span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button onClick={toggleFavorite} className={`flex items-center gap-1.5 bg-card rounded-lg py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-colors border-[1.5px] ${isFavorited ? "border-rose-600 text-rose-600" : "border-border-light text-text-primary hover:bg-background"}`}>
                      <Heart size={15} fill={isFavorited ? "currentColor" : "none"} />
                      {isFavorited ? "Favorited" : "Favorite"}
                    </button>
                    <button className="flex items-center gap-1.5 bg-primary border-none rounded-lg py-2.5 px-4 text-[13px] font-bold cursor-pointer text-white hover:from-primary-hover hover:to-primary-light transition-colors">
                      <MessageCircle size={15} />
                      Send Message
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted mt-2">Become Premium to start conversation</p>
                </div>
              </div>

              {/* Navigation tabs */}
              <div className="flex border-t border-border-light overflow-x-auto scrollbar-hide">
                {navTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`py-3 px-4 border-none bg-transparent cursor-pointer text-[13px] font-semibold whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? "text-primary border-primary" : "text-text-secondary border-transparent hover:text-primary"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content sections */}
            <div className="flex flex-col gap-4">

              {/* About Me */}
              <div className="bg-card rounded-[20px] py-[22px] px-6 border-[1.5px] border-border-light">
                <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary mb-3">
                  <span className="text-lg">💬</span> About Me
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary m-0">{about}</p>
              </div>

              {/* Education & Career + Religious (2 cols) */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <InfoSection title="Education & Career" icon="🎓" data={sections.education} />
                <InfoSection title="Religious Information" icon="🕌" data={sections.religious} />
              </div>

              {/* Family Details + Lifestyle (2 cols) */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <InfoSection title="Family Details" icon="👨‍👩‍👧" data={sections.family} />
                <InfoSection title="Lifestyle" icon="💚" data={sections.lifestyle} />
              </div>
            </div>

            {/* Similar Profiles */}
            {similarProfiles.length > 0 && (
              <div className="bg-card rounded-[20px] py-[22px] px-6 border-[1.5px] border-border-light">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-bold text-text-primary m-0">Other Members</h3>
                  <div className="flex items-center gap-2">
                    <Link to="/search" className="text-[13px] text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {similarProfiles.map((p) => (
                    <Link to={`/profile/${p.id}`} key={p.id} className="no-underline">
                      <div className="rounded-xl overflow-hidden border-[1.5px] border-border-light transition-all duration-200 hover:-translate-y-[3px] hover:shadow-sm">
                        <div className="h-[80px] flex items-center justify-center relative bg-primary-very-light overflow-hidden">
                          <img
                            src={photoUrl(p.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=e91e63&color=fff&size=200`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=e91e63&color=fff&size=200`; e.target.onerror = null; }}
                          />
                        </div>
                        <div className="pt-2 px-2.5 pb-2.5">
                          <div className="text-[11px] font-bold text-text-primary truncate">{p.name}, {p.age}</div>
                          <div className="text-[10px] text-text-secondary truncate">{p.profession}</div>
                          <div className="text-[10px] text-text-muted flex items-center gap-0.5 mt-0.5 truncate">
                            📍 {p.city}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="flex flex-col gap-5 lg:sticky top-[92px] min-w-0">

            {/* Interested CTA */}
            <div className="bg-card rounded-[20px] p-[22px] border-[1.5px] border-border-light">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👑</span>
                <h3 className="text-[15px] font-bold text-text-primary m-0">Interested in {name.split(" ")[0]}?</h3>
              </div>
              <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
                Upgrade to Premium to view contact details and start a conversation.
              </p>
              <Link to="/subscription" className="flex items-center justify-center gap-1.5 bg-primary text-white no-underline rounded-xl p-3 text-[13px] font-bold mb-3 hover:from-primary-hover hover:to-primary-light transition-all">
                <Lock size={14} /> Request Contact
              </Link>
              <div className="flex flex-col gap-2">
                {[
                  { icon: Eye,             label: "View Contact Details"    },
                  { icon: MessageCircle,   label: "Chat and Get Responses"  },
                  { icon: Heart,           label: "See who is interested in you" },
                  { icon: Shield,          label: "Priority in Recommendations" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2">
                    <f.icon size={13} className="text-primary" />
                    <span className="text-xs text-text-secondary">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-card rounded-[20px] p-[22px] border-[1.5px] border-border-light">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-text-primary m-0">Photo Gallery</h3>
              </div>
              {profile.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                      <img src={photoUrl(photo.photo_url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xl ${getAvatarGradient(i)}`}>
                      🖼️
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Looking for */}
            <div className="bg-card rounded-[20px] p-[22px] border-[1.5px] border-border-light">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-primary-very-light flex items-center justify-center">
                  <Shield size={14} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-text-primary m-0">What they're looking for</h3>
              </div>
              <p className="text-[13px] text-text-secondary m-0 leading-relaxed">{lookingFor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewPage;
