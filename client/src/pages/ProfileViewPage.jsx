import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Lock, MessageCircle, ChevronLeft, ChevronRight, Shield, Eye } from "lucide-react";

const profile = {
  name: "Ayesha Khan",
  age: 25,
  profession: "Doctor (MBBS)",
  city: "Lahore, Pakistan",
  lastSeen: "Last seen today",
  attributes: ["Never Married", "Sunni", "5'4\" (163 cm)", "Aga Khan"],
  about: "I am a simple, kind and caring person who believes in Islamic values and family. I love helping others and I am looking for a life partner who is honest, understanding and supportive.",
  education: {
    Education:  "MBBS · King Edward Medical University, Lahore",
    Profession: "Doctor",
    Workplace:  "Mayo Hospital, Lahore",
  },
  religious: {
    Religion:   "Islam",
    Sect:       "Sunni",
    Practicing: "Practicing",
    Hijab:      "Sometimes",
  },
  family: {
    "Father's Profession": "Business",
    "Mother's Profession": "Homemaker",
    "Siblings":            "1 Brother, 1 Sister",
    "Family Type":         "Nuclear Family",
    "Family Location":     "Lahore, Pakistan",
  },
  lifestyle: {
    Diet:             "Vegetarian",
    Smoke:            "No",
    Drink:            "No",
    "Physical Status":"Normal",
    "Blood Group":    "O+",
  },
  lookingFor: "I am looking for a responsible, God-fearing and family-oriented life partner.",
};

const navTabs = [
  "About",
  "Personal Information",
  "Education & Career",
  "Family Details",
  "Religious Information",
  "Lifestyle",
  "Interests & Hobbies",
  "Gallery",
  "Compatibility",
];

const similarProfiles = [
  { id: 2,  name: "Fatima Ali",    age: 26, profession: "Software Engineer", city: "Islamabad" },
  { id: 3,  name: "Zainab Malik",  age: 24, profession: "Teacher",           city: "Rawalpindi" },
  { id: 4,  name: "Hira Ahmed",    age: 23, profession: "Pharmacist",        city: "Karachi" },
  { id: 6,  name: "Sana Batool",   age: 27, profession: "Business Analyst",  city: "Faisalabad" },
  { id: 7,  name: "Iqra Saleem",   age: 25, profession: "Dentist",           city: "Multan" },
  { id: 8,  name: "Maryam Noor",   age: 26, profession: "Graphic Designer",  city: "Lahore" },
];

const avatarBg = ["#2d7a6e", "#6b4c8a", "#2d6e7e", "#7a6e2d", "#4c6e2d", "#7e2d2d"];

const InfoSection = ({ title, icon, data }) => (
  <div style={{ background: "#f8fafc", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #e8ebe9" }}>
    <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: "0 0 16px" }}>
      <span style={{ fontSize: 18 }}>{icon}</span> {title}
    </h3>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#94a3b8", minWidth: 120, fontWeight: 600 }}>{k}</span>
          <span style={{ fontSize: 13, color: "#1a2e2b", fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);

const ProfileViewPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("About");
  const [isShortlisted, setIsShortlisted] = useState(false);

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", background: "#f8f6f2", padding: "24px 24px 48px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b8a86", fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
          <ArrowLeft size={16} /> Back to Search Results
        </button>

        {/* ── 2-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }} className="profile-view-layout">

          {/* ── LEFT MAIN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* Hero banner */}
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e8ebe9", minWidth: 0 }}>
              <div style={{
                background: "linear-gradient(135deg, #2d7a6e44, #6b8a8622)",
                padding: "28px",
                display: "grid",
                gap: 24,
                alignItems: "flex-start",
              }} className="hero-banner-grid">
                {/* Profile photo */}
                <div style={{ position: "relative" }}>
                  <div style={{ width: 160, height: 200, borderRadius: 16, background: "linear-gradient(135deg, #2d7a6e, #1a5a50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: "#fff", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                    A
                  </div>
                  <div style={{ position: "absolute", bottom: 10, left: 10, background: "#0f5d52", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    <Shield size={11} /> Verified Profile
                  </div>
                </div>

                {/* Name + info */}
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a2e2b", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                    {profile.name}, {profile.age}
                    <span style={{ color: "#0f5d52", fontSize: 20 }}>✓</span>
                  </h1>
                  <p style={{ fontSize: 15, color: "#4a6360", margin: "0 0 10px" }}>{profile.profession}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#6b8a86" }}>
                      <MapPin size={14} /> {profile.city}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#22c55e", fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} /> {profile.lastSeen}
                    </span>
                  </div>

                  {/* Attribute chips */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    {profile.attributes.map(a => (
                      <span key={a} style={{ background: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#1a2e2b", border: "1px solid #e2e8f0" }}>{a}</span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setIsShortlisted(v => !v)} style={{
                      display: "flex", alignItems: "center", gap: 7,
                      background: "#fff", border: `1.5px solid ${isShortlisted ? "#e11d48" : "#e2e8f0"}`,
                      borderRadius: 10, padding: "10px 18px",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      color: isShortlisted ? "#e11d48" : "#334155",
                    }}>
                      <Heart size={15} fill={isShortlisted ? "#e11d48" : "none"} color={isShortlisted ? "#e11d48" : "#334155"} />
                      {isShortlisted ? "Shortlisted" : "Shortlist"}
                    </button>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 7,
                      background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                      border: "none", borderRadius: 10, padding: "10px 18px",
                      fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff",
                    }}>
                      <MessageCircle size={15} />
                      Send Message
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Become Premium to start conversation</p>
                </div>
              </div>

              {/* Navigation tabs */}
              <div style={{ display: "flex", borderTop: "1px solid #e8ebe9", overflowX: "auto" }}>
                {navTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: activeTab === tab ? "#0f5d52" : "#6b8a86",
                      borderBottom: activeTab === tab ? "2px solid #0f5d52" : "2px solid transparent",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* About Me */}
              <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", border: "1.5px solid #e8ebe9" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: "0 0 12px" }}>
                  <span style={{ fontSize: 18 }}>💬</span> About Me
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4a6360", margin: 0 }}>{profile.about}</p>
              </div>

              {/* Education & Career + Religious (2 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="info-double-grid">
                <InfoSection title="Education & Career" icon="🎓" data={profile.education} />
                <InfoSection title="Religious Information" icon="🕌" data={profile.religious} />
              </div>

              {/* Family Details + Lifestyle (2 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="info-double-grid">
                <InfoSection title="Family Details" icon="👨‍👩‍👧" data={profile.family} />
                <InfoSection title="Lifestyle" icon="💚" data={profile.lifestyle} />
              </div>
            </div>

            {/* Similar Profiles */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", border: "1.5px solid #e8ebe9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Similar Profiles</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <a href="#" style={{ fontSize: 13, color: "#0f5d52", fontWeight: 700, textDecoration: "none" }}>View All</a>
                  <button style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={14} color="#64748b" />
                  </button>
                  <button style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight size={14} color="#64748b" />
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }} className="similar-grid">
                {similarProfiles.map((p, i) => (
                  <Link to={`/profile/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
                    <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #e8ebe9", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{
                        height: 80,
                        background: `linear-gradient(135deg, ${avatarBg[i % avatarBg.length]}30, ${avatarBg[i % avatarBg.length]}60)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarBg[i % avatarBg.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700 }}>
                          {p.name[0]}
                        </div>
                        <div style={{ position: "absolute", bottom: 5, left: 5, background: "#22c55e", color: "#fff", borderRadius: 4, fontSize: 8, fontWeight: 700, padding: "2px 5px" }}>Online</div>
                      </div>
                      <div style={{ padding: "8px 10px 10px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1a2e2b" }}>{p.name}, {p.age}</div>
                        <div style={{ fontSize: 10, color: "#6b8a86" }}>{p.profession}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}>
                          📍 {p.city}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 92, minWidth: 0 }}>

            {/* Interested CTA */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px", border: "1.5px solid #e8ebe9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>👑</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Interested in Ayesha?</h3>
              </div>
              <p style={{ fontSize: 13, color: "#6b8a86", margin: "0 0 16px", lineHeight: 1.5 }}>
                Upgrade to Premium to view contact details and start a conversation.
              </p>
              <Link to="/subscription" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                color: "#fff", textDecoration: "none",
                borderRadius: 12, padding: "12px",
                fontSize: 13, fontWeight: 700, marginBottom: 12,
              }}>
                <Lock size={14} /> Request Contact
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: Eye,             label: "View Contact Details"    },
                  { icon: MessageCircle,   label: "Chat and Get Responses"  },
                  { icon: Heart,           label: "See who is interested in you" },
                  { icon: Shield,          label: "Priority in Recommendations" },
                ].map(f => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <f.icon size={13} color="#0f5d52" />
                    <span style={{ fontSize: 12, color: "#6b8a86" }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px", border: "1.5px solid #e8ebe9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Photo Gallery</h3>
                <a href="#" style={{ fontSize: 12, color: "#0f5d52", fontWeight: 700, textDecoration: "none" }}>View All</a>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${avatarBg[i % avatarBg.length]}30, ${avatarBg[i % avatarBg.length]}60)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, cursor: "pointer",
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    🖼️
                  </div>
                ))}
              </div>
            </div>

            {/* Looking for */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "22px", border: "1.5px solid #e8ebe9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#edf7f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={14} color="#0f5d52" />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a2e2b", margin: 0 }}>Looking for something serious</h3>
              </div>
              <p style={{ fontSize: 13, color: "#6b8a86", margin: 0, lineHeight: 1.6 }}>{profile.lookingFor}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-banner-grid { grid-template-columns: auto 1fr; }
        @media (max-width: 1100px) {
          .profile-view-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .hero-banner-grid { grid-template-columns: 1fr !important; justify-items: center; text-align: center; }
          .hero-banner-grid > div:last-child { align-items: center; display: flex; flex-direction: column; }
          .info-double-grid { grid-template-columns: 1fr !important; }
          .similar-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 450px) {
          .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default ProfileViewPage;
