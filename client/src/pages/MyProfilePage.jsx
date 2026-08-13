import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Edit3, MapPin, Briefcase, Heart, User, Users, Coffee, Shield,
  CheckCircle2, GraduationCap, Book, Camera, ChevronRight, Star,
  Globe, Home, Utensils, Moon, AlertCircle, Crown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { photoUrl } from "../lib/photoUrl";

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
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [error, setError] = useState(false);

  // Always reload from the backend on visit — never rely on stale state from
  // an earlier page. GET /api/profile/me is authenticated via the JWT, so
  // there's no way to see (or accidentally request) another user's data here.
  const loadProfile = async () => {
    setError(false);
    const data = await refreshProfile();
    if (!data) setError(true);
  };

  useEffect(() => {
    if (!user?.id) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRetry = () => loadProfile();

  const loading = profileLoading && !profile;

  // Derived display values
  const displayName = user?.name
    || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "My Profile");

  const initials = displayName.slice(0, 2).toUpperCase();

  // Real, backend-calculated completion — same number the Dashboard widget
  // and the Complete Profile wizard show. No local recalculation here.
  const completion = profile?.completion?.profileCompletion ?? 0;
  const hasAnyProfileData = completion > 0;

  const dob = profile?.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb]">
        <LoadingState message="Loading your profile…" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb]">
        <ErrorState onRetry={handleRetry} />
      </div>
    );
  }

  // ── No Profile Yet ──────────────────────────────────────────────────────────
  if (!profile || !hasAnyProfileData) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb]">
        <EmptyState
          icon={User}
          title="Your Profile is Empty"
          description="Complete your profile to get better matches and let others know more about you."
          actionText="Complete Profile"
          actionLink="/profile-setup"
        />
      </div>
    );
  }

  // ── Full Profile View ───────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8">
      <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-6">

        {/* ── HEADER CARD ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          {/* Cover gradient */}
          <div className="h-[120px] bg-gradient-to-r from-pink-50 via-[#fff0f5] to-pink-100 relative" />

          <div className="px-6 md:px-8 pb-7 relative">
            {/* Avatar */}
            <div className="relative -mt-[52px] mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="relative self-start sm:self-auto">
                <div className="w-[100px] h-[100px] rounded-full border-4 border-white shadow-md bg-[#E91E63] flex items-center justify-center text-white text-[32px] font-bold overflow-hidden">
                  {profile.profile_photo_url
                    ? <img src={photoUrl(profile.profile_photo_url)} alt={displayName} className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-2 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>

              {/* Edit buttons */}
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
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
                  {/* Real premium status — from GET /api/profile/me (isPremium), backed by an active subscriptions row. */}
                  {profile.isPremium && (
                    <div className="flex items-center gap-1 bg-[#fff0f5] border border-pink-100 rounded-full px-2.5 py-0.5">
                      <Crown size={12} className="text-[#E91E63]" />
                      <span className="text-[11px] font-bold text-[#E91E63]">Premium</span>
                    </div>
                  )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              <InfoRow label="Preferred Age Range"     value={profile.partner_age_range} />
              <InfoRow label="Preferred Marital Status" value={profile.partner_marital_status} />
              <InfoRow label="Preferred Education"     value={profile.partner_education} />
              <InfoRow label="Preferred Height"        value={profile.partner_height_range} />
              <InfoRow label="Preferred Occupation"    value={profile.partner_occupation} />
            </div>
            {profile.partner_countries?.length > 0 && (
              <div className="border-t border-slate-100 mt-2 pt-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Preferred Countries
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.partner_countries.map(c => (
                    <span key={c.id} className="bg-[#fff0f5] border border-pink-100 rounded-full px-2.5 py-1 text-[12px] font-semibold text-[#E91E63]">
                      {c.flag_emoji} {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  <img src={photoUrl(profile.profile_photo_url)} alt="Profile" className="w-full h-full object-cover" />
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
