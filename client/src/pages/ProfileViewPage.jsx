import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  { id: 8,  name: "Areeba Hassan", age: 26, profession: "Interior Designer", city: "Islamabad" },
];

const userDetails = {
  1: { name: "Ayesha Khan", age: 25, profession: "Doctor", city: "Lahore, Pakistan" },
  2: { name: "Fatima Ali", age: 26, profession: "Software Engineer", city: "Islamabad, Pakistan" },
  3: { name: "Zainab Malik", age: 24, profession: "Teacher", city: "Rawalpindi, Pakistan" },
  4: { name: "Hira Ahmed", age: 23, profession: "Pharmacist", city: "Karachi, Pakistan" },
  5: { name: "Maryam Noor", age: 25, profession: "Graphic Designer", city: "Lahore, Pakistan" },
  6: { name: "Sana Batool", age: 27, profession: "Business Analyst", city: "Faisalabad, Pakistan" },
  7: { name: "Iqra Saleem", age: 24, profession: "Dentist", city: "Multan, Pakistan" },
  8: { name: "Areeba Hassan", age: 26, profession: "Interior Designer", city: "Islamabad, Pakistan" },
};

const getAvatarBg = (i) => ["bg-[#2d7a6e]", "bg-[#6b4c8a]", "bg-[#2d6e7e]", "bg-[#7a6e2d]", "bg-[#4c6e2d]", "bg-[#7e2d2d]"][i % 6];
const getAvatarGradient = (i) => ["bg-gradient-to-br from-[#2d7a6e30] to-[#2d7a6e60]", "bg-gradient-to-br from-[#6b4c8a30] to-[#6b4c8a60]", "bg-gradient-to-br from-[#2d6e7e30] to-[#2d6e7e60]", "bg-gradient-to-br from-[#7a6e2d30] to-[#7a6e2d60]", "bg-gradient-to-br from-[#4c6e2d30] to-[#4c6e2d60]", "bg-gradient-to-br from-[#7e2d2d30] to-[#7e2d2d60]"][i % 6];

const InfoSection = ({ title, icon, data }) => (
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

const ProfileViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("About");
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, { credentials: "omit" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(f => String(f.target_profile_id) === String(id));
          setIsFavorited(!!found);
        }
      })
      .catch(console.error);
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_profile_id: parseInt(id) || 1 }) // fallback for dummy data
      });
      if (res.ok) {
        setIsFavorited(v => !v);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentDetails = userDetails[id] || userDetails[1];
  const displayProfile = { ...profile, ...currentDetails };
  const imageSrc = id && id >= 1 && id <= 8 ? `/images/profile_f${id}.jpg` : "/images/profile_f1.jpg";

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background px-4 md:px-6 py-6 md:py-12 overflow-x-hidden">
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
                  <div className="w-full aspect-[4/5] md:w-[160px] md:h-[200px] md:aspect-auto rounded-2xl overflow-hidden shadow-sm bg-primary-very-light">
                    <img src={imageSrc} alt={displayProfile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-primary text-white rounded-lg text-[11px] font-bold py-1 px-2.5 flex items-center gap-1">
                    <Shield size={11} /> Verified Profile
                  </div>
                </div>

                {/* Name + info */}
                <div className="flex flex-col md:block items-center w-full min-w-0">
                  <h1 className="text-[28px] font-extrabold text-text-primary mb-1 flex flex-wrap justify-center md:justify-start items-center gap-2 text-center md:text-left break-words">
                    {displayProfile.name}, {displayProfile.age}
                    <span className="text-primary text-xl">✓</span>
                  </h1>
                  <p className="text-[15px] text-text-secondary mb-2.5">{displayProfile.profession}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-1 text-[13px] text-text-secondary">
                      <MapPin size={14} /> {displayProfile.city}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] text-green-500 font-semibold">
                      <span className="w-[7px] h-[7px] rounded-full bg-green-500" /> {profile.lastSeen}
                    </span>
                  </div>

                  {/* Attribute chips */}
                  <div className="flex gap-2 flex-wrap mb-5 justify-center md:justify-start">
                    {displayProfile.attributes.map(a => (
                      <span key={a} className="bg-card/80 rounded-lg py-1 px-3 text-xs font-semibold text-text-primary border border-border-light">{a}</span>
                    ))}
                  </div>

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
                <p className="text-sm leading-relaxed text-text-secondary m-0">{displayProfile.about}</p>
              </div>

              {/* Education & Career + Religious (2 cols) */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <InfoSection title="Education & Career" icon="🎓" data={displayProfile.education} />
                <InfoSection title="Religious Information" icon="🕌" data={displayProfile.religious} />
              </div>

              {/* Family Details + Lifestyle (2 cols) */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <InfoSection title="Family Details" icon="👨‍👩‍👧" data={displayProfile.family} />
                <InfoSection title="Lifestyle" icon="💚" data={displayProfile.lifestyle} />
              </div>
            </div>

            {/* Similar Profiles */}
            <div className="bg-card rounded-[20px] py-[22px] px-6 border-[1.5px] border-border-light">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-text-primary m-0">Similar Profiles</h3>
                <div className="flex items-center gap-2">
                  <a href="#" className="text-[13px] text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</a>
                  <button className="w-7 h-7 rounded-full border-[1.5px] border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-background transition-colors">
                    <ChevronLeft size={14} className="text-text-secondary" />
                  </button>
                  <button className="w-7 h-7 rounded-full border-[1.5px] border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-background transition-colors">
                    <ChevronRight size={14} className="text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {similarProfiles.map((p, i) => (
                  <Link to={`/profile/${p.id}`} key={p.id} className="no-underline">
                    <div className="rounded-xl overflow-hidden border-[1.5px] border-border-light transition-all duration-200 hover:-translate-y-[3px] hover:shadow-sm">
                      <div className={`h-[80px] flex items-center justify-center relative bg-primary-very-light overflow-hidden`}>
                        <img src={`/images/profile_f${p.id}.jpg`} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 left-1 bg-green-500 text-white rounded text-[8px] font-bold py-0.5 px-1">Online</div>
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
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="flex flex-col gap-5 lg:sticky top-[92px] min-w-0">

            {/* Interested CTA */}
            <div className="bg-card rounded-[20px] p-[22px] border-[1.5px] border-border-light">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👑</span>
                <h3 className="text-[15px] font-bold text-text-primary m-0">Interested in {displayProfile.name.split(" ")[0]}?</h3>
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
                <a href="#" className="text-xs text-primary font-bold no-underline hover:text-primary-dark transition-colors">View All</a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xl cursor-pointer hover:opacity-80 transition-opacity ${getAvatarGradient(i)}`}>
                    🖼️
                  </div>
                ))}
              </div>
            </div>

            {/* Looking for */}
            <div className="bg-card rounded-[20px] p-[22px] border-[1.5px] border-border-light">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-primary-very-light flex items-center justify-center">
                  <Shield size={14} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-text-primary m-0">Looking for something serious</h3>
              </div>
              <p className="text-[13px] text-text-secondary m-0 leading-relaxed">{displayProfile.lookingFor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewPage;
