import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Edit3, Shield, User, Briefcase, Users, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const InfoSection = ({ title, icon, data }) => (
  <div className="bg-card rounded-2xl py-5 px-6 border-[1.5px] border-border-light">
    <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary mb-4">
      <span className="text-lg text-primary">{icon}</span> {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
      {Object.entries(data).filter(([_, v]) => v).map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1">
          <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">{k}</span>
          <span className="text-[13px] text-text-primary font-semibold">{v}</span>
        </div>
      ))}
    </div>
  </div>
);

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/api/profile/${user.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Not found");
        })
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className="w-20 h-20 bg-primary-very-light text-primary rounded-full flex items-center justify-center mb-6">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Your Profile is Empty</h2>
        <p className="text-text-secondary mb-8 max-w-md">Complete your profile to get better matches and let others know more about you.</p>
        <Link to="/profile-setup" className="bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all px-8 py-3 text-sm font-bold no-underline">
          Setup Profile Now
        </Link>
      </div>
    );
  }

  // Map backend fields to display groups
  const personalInfo = {
    "Gender": profile.gender,
    "Date of Birth": profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "",
    "Marital Status": profile.marital_status,
    "Height": profile.height,
    "Weight": profile.weight ? `${profile.weight} kg` : "",
    "Mother Tongue": profile.mother_tongue,
    "Nationality": profile.nationality,
  };

  const educationCareer = {
    "Highest Education": profile.education,
    "Occupation": profile.occupation,
    "Annual Income": profile.annual_income,
  };

  const familyDetails = {
    "Family Type": profile.family_type,
    "Family Values": profile.family_values,
    "Father's Occupation": profile.father_occupation,
    "Mother's Occupation": profile.mother_occupation,
    "Siblings": profile.siblings_count !== null ? `${profile.siblings_count}` : "",
  };

  const faithLifestyle = {
    "Religion": profile.religion,
    "Sect": profile.sect,
    "Prayer Frequency": profile.prayer_frequency,
    "Religious Preference": profile.religious_preference,
    "Diet": profile.dietary_preference,
    "Smoking": profile.smoking,
    "Drinking": profile.drinking,
  };

  const partnerPrefs = {
    "Age Range": profile.partner_age_range,
    "Marital Status": profile.partner_marital_status,
    "Education": profile.partner_education,
    "Height Range": profile.partner_height_range,
  };

  const displayName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "My Profile");

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background px-4 md:px-6 py-6 md:py-12 overflow-x-hidden">
      <div className="w-full max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-text-secondary text-[13px] font-semibold hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <Link to="/profile-setup" className="inline-flex items-center gap-1.5 bg-card border border-border-light rounded-lg px-4 py-2 text-sm font-bold text-text-primary hover:bg-slate-50 transition-colors no-underline">
            <Edit3 size={15} className="text-primary" /> Edit Profile
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {/* Header Card */}
          <div className="bg-card rounded-[20px] overflow-hidden border-[1.5px] border-border-light flex flex-col md:flex-row items-center md:items-start p-6 md:p-8 gap-6 md:gap-8">
            <div className="w-[120px] h-[120px] rounded-full bg-primary-very-light flex items-center justify-center text-primary text-[40px] font-bold shrink-0 border-4 border-white shadow-sm overflow-hidden relative">
              {profile.profile_photo_url ? (
                 <img src={profile.profile_photo_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase()
              )}
            </div>
            <div className="flex flex-col text-center md:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-text-primary mb-2 flex items-center justify-center md:justify-start gap-2">
                {displayName}
                <Shield size={18} className="text-primary" />
              </h1>
              <p className="text-[15px] font-semibold text-text-secondary mb-3 flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={15} /> {profile.occupation || "Occupation not set"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                {profile.city && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary bg-background px-3 py-1.5 rounded-lg border border-border-light">
                    <MapPin size={14} className="text-primary" /> {profile.city}{profile.state ? `, ${profile.state}` : ""}
                  </span>
                )}
                {profile.marital_status && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary bg-background px-3 py-1.5 rounded-lg border border-border-light">
                    <Heart size={14} className="text-primary" /> {profile.marital_status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About Me */}
          {profile.about_me && (
            <div className="bg-card rounded-[20px] py-6 px-8 border-[1.5px] border-border-light">
              <h3 className="text-[15px] font-bold text-text-primary mb-3">About Me</h3>
              <p className="text-[14px] leading-relaxed text-text-secondary m-0">{profile.about_me}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoSection title="Personal Information" icon={<User size={18}/>} data={personalInfo} />
            <InfoSection title="Education & Career" icon={<Briefcase size={18}/>} data={educationCareer} />
            <InfoSection title="Family Details" icon={<Users size={18}/>} data={familyDetails} />
            <InfoSection title="Faith & Lifestyle" icon={<Heart size={18}/>} data={faithLifestyle} />
          </div>

          {/* Partner Preferences */}
          <div className="bg-card rounded-[20px] py-6 px-8 border-[1.5px] border-border-light">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary mb-4">
              <span className="text-lg text-primary"><Heart size={18} /></span> Partner Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 mb-4">
              {Object.entries(partnerPrefs).filter(([_, v]) => v).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">{k}</span>
                  <span className="text-[13px] text-text-primary font-semibold">{v}</span>
                </div>
              ))}
            </div>
            {profile.partner_about && (
              <div className="mt-4 pt-4 border-t border-border-light">
                <span className="block text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">What I'm looking for</span>
                <p className="text-[14px] leading-relaxed text-text-secondary m-0">{profile.partner_about}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
