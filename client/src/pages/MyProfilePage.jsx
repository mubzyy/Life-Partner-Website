import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit3, MapPin, Briefcase, Heart, User, Users, Coffee, Shield,
  CheckCircle2, GraduationCap, Book, Camera, ChevronRight, Star,
  Globe, Home, Utensils, Moon, AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── Completion calculator ──────────────────────────────────────────────────────
const PROFILE_FIELDS = [
  "profile_photo_url", "gender", "date_of_birth", "marital_status",
  "height", "weight", "religion", "sect", "mother_tongue", "nationality",
  "state", "city", "about_me", "occupation", "education",
  "father_occupation", "mother_occupation", "siblings_count",
  "family_type", "family_values", "smoking", "drinking",
  "prayer_frequency", "dietary_preference",
  "partner_age_range", "partner_marital_status", "partner_education",
];

const getCompletion = (profile) => {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter(k => {
    const v = profile[k];
    return v !== null && v !== undefined && v !== "" && String(v).trim() !== "";
  });
  return Math.round((filled.length / PROFILE_FIELDS.length) * 100);
};

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-[14px] text-slate-800 font-semibold">{value}</span>
    </div>
  );
};

// ── Info Card ─────────────────────────────────────────────────────────────────
const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
      <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h3 className="text-[15px] font-bold text-slate-800 m-0">{title}</h3>
    </div>
    <div className="px-6 py-2">{children}</div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL}/api/profile/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [user?.id]);

  // Derived display values
  const displayName = user?.name
    || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "My Profile");

  const initials = displayName.slice(0, 2).toUpperCase();

  const completion = getCompletion(profile);

  const dob = profile?.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[#f9fafb]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-slate-500 font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ── No Profile Yet ──────────────────────────────────────────────────────────
  if (!profile || error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-10 max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-[#fff0f5] flex items-center justify-center mx-auto mb-5">
            <User size={36} className="text-[#E91E63]" />
          </div>
          <h2 className="text-[22px] font-bold text-slate-800 mb-2">Your Profile is Empty</h2>
          <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
            Complete your profile to get better matches and let others know more about you.
          </p>
          <Link to="/profile-setup"
            className="inline-flex items-center justify-center gap-2 bg-[#E91E63] hover:bg-[#d81557] text-white font-bold rounded-[14px] px-8 py-3.5 text-[14px] no-underline transition-colors shadow-md">
            Complete Profile <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Full Profile View ───────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8 overflow-x-hidden">
      <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-6">

        {/* ── HEADER CARD ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          {/* Cover gradient */}
          <div className="h-[120px] bg-gradient-to-r from-pink-50 via-[#fff0f5] to-pink-100 relative" />

          <div className="px-6 md:px-8 pb-7 relative">
            {/* Avatar */}
            <div className="relative -mt-[52px] mb-4 flex items-end justify-between flex-wrap gap-4">
              <div className="relative">
                <div className="w-[100px] h-[100px] rounded-full border-4 border-white shadow-md bg-[#E91E63] flex items-center justify-center text-white text-[32px] font-bold overflow-hidden">
                  {profile.profile_photo_url
                    ? <img src={profile.profile_photo_url} alt={displayName} className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-2 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>

              {/* Edit buttons */}
              <div className="flex flex-wrap gap-2 mt-[52px] sm:mt-0">
                <button
                  onClick={() => navigate("/profile-setup")}
                  className="flex items-center gap-2 bg-white border-2 border-[#E91E63] text-[#E91E63] hover:bg-[#fff0f5] font-bold rounded-[12px] px-4 py-2 text-[13px] transition-colors cursor-pointer">
                  <Edit3 size={15} /> Edit Profile
                </button>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-[12px] px-4 py-2 text-[13px] transition-colors cursor-pointer">
                  <Camera size={15} /> Edit Photos
                </button>
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-[24px] md:text-[28px] font-extrabold text-slate-800 m-0">
                    {displayName}{age ? `, ${age}` : ""}
                  </h1>
                  <CheckCircle2 size={20} fill="#E91E63" color="white" />
                  <div className="flex items-center gap-1 bg-[#fff0f5] border border-pink-100 rounded-full px-2.5 py-0.5">
                    <Shield size={12} className="text-[#E91E63]" />
                    <span className="text-[11px] font-bold text-[#E91E63]">Verified</span>
                  </div>
                </div>

                {/* Profession & Location */}
                <div className="flex flex-wrap items-center gap-3 text-[14px] text-slate-500 mb-4">
                  {profile.occupation && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={15} className="text-[#E91E63]" />
                      <span className="font-medium">{profile.occupation}</span>
                    </div>
                  )}
                  {(profile.city || profile.state) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-[#E91E63]" />
                      <span className="font-medium">
                        {[profile.city, profile.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.religion && (
                    <div className="flex items-center gap-1.5">
                      <Star size={15} className="text-[#E91E63]" />
                      <span className="font-medium">{profile.religion}{profile.sect ? ` · ${profile.sect}` : ""}</span>
                    </div>
                  )}
                </div>

                {/* About Me preview */}
                {profile.about_me && (
                  <p className="text-[14px] text-slate-600 leading-relaxed max-w-xl m-0">
                    {profile.about_me}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPLETION CARD ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-bold text-slate-800 m-0">Profile Completion</h3>
                <span className={`text-[13px] font-extrabold ${completion >= 80 ? "text-green-600" : "text-[#E91E63]"}`}>
                  {completion}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${completion}%`,
                    background: "linear-gradient(90deg, #E91E63, #ff6090)"
                  }}
                />
              </div>
              <p className="text-[12px] text-slate-500 mt-2 m-0">
                {completion < 50
                  ? "Your profile needs more information to attract matches."
                  : completion < 80
                  ? "Great progress! A few more details will get you better matches."
                  : "Your profile is looking great!"}
              </p>
            </div>
            <Link to="/profile-setup"
              className="flex items-center gap-2 whitespace-nowrap bg-[#E91E63] hover:bg-[#d81557] text-white font-bold rounded-[12px] px-5 py-2.5 text-[13px] no-underline transition-colors shadow-sm shrink-0">
              Complete Profile <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── 2-COLUMN DETAIL GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Personal Information */}
          <InfoCard title="Personal Information" icon={<User size={16} className="text-[#E91E63]" />}>
            <InfoRow label="Gender"         value={profile.gender} />
            <InfoRow label="Date of Birth"  value={dob} />
            <InfoRow label="Age"            value={age ? `${age} years old` : null} />
            <InfoRow label="Marital Status" value={profile.marital_status} />
            <InfoRow label="Height"         value={profile.height} />
            <InfoRow label="Weight"         value={profile.weight ? `${profile.weight} kg` : null} />
            <InfoRow label="Mother Tongue"  value={profile.mother_tongue} />
            <InfoRow label="Nationality"    value={profile.nationality} />
            <InfoRow label="Country"        value={profile.country_name || null} />
            <InfoRow label="State / Province" value={profile.state} />
            <InfoRow label="City"           value={profile.city} />
            {!profile.gender && !profile.date_of_birth && (
              <div className="py-4 flex items-center gap-2 text-[13px] text-slate-400">
                <AlertCircle size={16} /> No personal info added yet.
              </div>
            )}
          </InfoCard>

          {/* Education & Career */}
          <InfoCard title="Education & Career" icon={<GraduationCap size={16} className="text-[#E91E63]" />}>
            <InfoRow label="Highest Education"   value={profile.education} />
            <InfoRow label="Current Occupation"  value={profile.occupation} />
            <InfoRow label="Annual Income"        value={profile.annual_income} />
            {!profile.education && !profile.occupation && (
              <div className="py-4 flex items-center gap-2 text-[13px] text-slate-400">
                <AlertCircle size={16} /> No education or career info added yet.
              </div>
            )}
          </InfoCard>

          {/* Family Background */}
          <InfoCard title="Family Background" icon={<Users size={16} className="text-[#E91E63]" />}>
            <InfoRow label="Father's Occupation" value={profile.father_occupation} />
            <InfoRow label="Mother's Occupation" value={profile.mother_occupation} />
            <InfoRow label="Number of Siblings"  value={profile.siblings_count !== null && profile.siblings_count !== undefined ? String(profile.siblings_count) : null} />
            <InfoRow label="Family Type"         value={profile.family_type} />
            <InfoRow label="Family Values"       value={profile.family_values} />
            {!profile.family_type && !profile.father_occupation && (
              <div className="py-4 flex items-center gap-2 text-[13px] text-slate-400">
                <AlertCircle size={16} /> No family info added yet.
              </div>
            )}
          </InfoCard>

          {/* Faith & Lifestyle */}
          <InfoCard title="Faith & Lifestyle" icon={<Moon size={16} className="text-[#E91E63]" />}>
            <InfoRow label="Religion"              value={profile.religion} />
            <InfoRow label="Sect"                  value={profile.sect} />
            <InfoRow label="Prayer Frequency"      value={profile.prayer_frequency} />
            <InfoRow label="Religious Preference"  value={profile.religious_preference} />
            <InfoRow label="Dietary Preference"    value={profile.dietary_preference} />
            <InfoRow label="Smoking"               value={profile.smoking} />
            <InfoRow label="Drinking"              value={profile.drinking} />
            {!profile.religion && !profile.prayer_frequency && (
              <div className="py-4 flex items-center gap-2 text-[13px] text-slate-400">
                <AlertCircle size={16} /> No faith or lifestyle info added yet.
              </div>
            )}
          </InfoCard>

        </div>

        {/* ── PARTNER PREFERENCES (full width) ─────────────────────────────── */}
        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center shrink-0">
              <Heart size={16} className="text-[#E91E63]" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-800 m-0">Partner Preferences</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6">
              <InfoRow label="Preferred Age Range"     value={profile.partner_age_range} />
              <InfoRow label="Preferred Marital Status" value={profile.partner_marital_status} />
              <InfoRow label="Preferred Education"     value={profile.partner_education} />
              <InfoRow label="Preferred Height"        value={profile.partner_height_range} />
              <InfoRow label="Preferred Occupation"    value={profile.partner_occupation} />
            </div>
            {profile.partner_about && (
              <div className="border-t border-slate-100 mt-2 pt-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  What I'm Looking For
                </span>
                <p className="text-[14px] text-slate-700 leading-relaxed m-0">{profile.partner_about}</p>
              </div>
            )}
            {!profile.partner_age_range && !profile.partner_marital_status && !profile.partner_about && (
              <div className="py-4 flex items-center gap-2 text-[13px] text-slate-400">
                <AlertCircle size={16} />
                <span>No partner preferences set yet.</span>
                <Link to="/profile-setup" className="text-[#E91E63] font-bold no-underline hover:opacity-80 ml-1">Add now →</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── PHOTOS SECTION ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center shrink-0">
                <Camera size={16} className="text-[#E91E63]" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 m-0">Photos</h3>
            </div>
            <button
              onClick={() => navigate("/profile-setup")}
              className="text-[12px] font-bold text-[#E91E63] hover:opacity-80 bg-transparent border-none cursor-pointer">
              + Add Photos
            </button>
          </div>

          <div className="p-5">
            {profile.profile_photo_url ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Primary photo */}
                <div className="col-span-2 row-span-2 aspect-square rounded-[16px] overflow-hidden border border-slate-100 relative group">
                  <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-[#E91E63] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Main
                  </div>
                </div>
                {/* Placeholder additional slots */}
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square rounded-[16px] bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#fff0f5] hover:border-pink-200 transition-colors group"
                    onClick={() => navigate("/profile-setup")}>
                    <Camera size={20} className="text-slate-300 group-hover:text-[#E91E63] transition-colors" />
                    <span className="text-[11px] text-slate-400 group-hover:text-[#E91E63] font-medium">Add photo</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#fff0f5] flex items-center justify-center mb-4">
                  <Camera size={28} className="text-[#E91E63]" />
                </div>
                <h4 className="text-[15px] font-bold text-slate-800 mb-2">No photos yet</h4>
                <p className="text-[13px] text-slate-500 mb-5 max-w-xs">
                  Profiles with photos get 8× more views. Add your best photos to stand out.
                </p>
                <button
                  onClick={() => navigate("/profile-setup")}
                  className="flex items-center gap-2 bg-[#E91E63] hover:bg-[#d81557] text-white font-bold rounded-[12px] px-6 py-2.5 text-[13px] transition-colors border-none cursor-pointer shadow-sm">
                  <Camera size={15} /> Upload Photo
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyProfilePage;
