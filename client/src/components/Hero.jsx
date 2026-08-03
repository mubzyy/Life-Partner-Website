import { Heart, Shield, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const trustBadges = [
  { icon: Shield, label: "100%", sub: "Verified Profiles" },
  { icon: Shield, label: "Privacy", sub: "Guaranteed" },
  { icon: Heart,  label: "50k+",   sub: "Successful Matches" },
  { icon: Clock,  label: "24/7",   sub: "Support" },
];

const Hero = () => (
  <section
    id="home"
    className="relative overflow-hidden bg-[linear-gradient(135deg,#f7f5f0_0%,#eef6f4_50%,#f5f0e8_100%)] pt-[80px] pb-[60px]"
  >
    {/* Decorative blobs */}
    <div className="absolute -top-[80px] -right-[80px] w-[400px] h-[400px] rounded-full bg-brand/5 pointer-events-none" />
    <div className="absolute -bottom-[60px] -left-[60px] w-[300px] h-[300px] rounded-full bg-gold/5 pointer-events-none" />

    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center relative z-10">

      {/* ── Left column ── */}
      <div>
        <h1 className="font-serif leading-[1.08] text-[#1a2e2b] mb-5 text-5xl sm:text-6xl md:text-7xl font-bold">
          Find Your<br />
          <span className="text-brand">Life Partner</span>
        </h1>

        <p className="text-[#4a6360] max-w-[440px] mb-8 text-base md:text-lg leading-relaxed">
          A trusted Muslim matrimonial platform where serious individuals connect with their perfect life partner, with the blessings of faith and family.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-[14px] flex-wrap mb-10">
          <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-br from-brand to-brand-mid text-white no-underline px-7 py-3.5 rounded-[10px] text-[15px] font-bold shadow-[0_6px_20px_rgba(15,93,82,0.3)]">
            <Heart size={17} fill="white" />
            Find Your Life Partner
          </Link>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-slate-800 border-[1.5px] border-[#d0dcd8] no-underline px-7 py-3.5 rounded-[10px] text-[15px] font-bold">
            <span className="text-base">👤</span>
            Create Profile
          </Link>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: "🛡️", label: "100%",    sub: "Verified Profiles"   },
            { icon: "🔒", label: "Privacy", sub: "Guaranteed"          },
            { icon: "💚", label: "50k+",    sub: "Successful Matches"  },
            { icon: "🕐", label: "24/7",    sub: "Support"             },
          ].map(b => (
            <div key={b.label} className="text-center">
              <div className="text-[20px] mb-1">{b.icon}</div>
              <div className="font-extrabold text-[15px] text-[#1a2e2b]">{b.label}</div>
              <div className="text-[11px] text-[#6b8a86] font-medium">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right column — hero image + Quran verse card ── */}
      <div className="relative flex justify-center w-full">
        <div className="w-full max-w-[500px] aspect-[4/3.2] rounded-[24px] overflow-hidden bg-[linear-gradient(135deg,#d4e8e3_0%,#e8d5b0_100%)] flex items-center justify-center relative shadow-[0_20px_60px_rgba(15,93,82,0.15)]">
          {/* Decorative mosque silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 500 350" className="w-full h-full opacity-15">
              <path d="M200 350V200C200 160 230 130 250 120C270 130 300 160 300 200V350Z" fill="#0f5d52"/>
              <path d="M240 120C240 110 245 100 250 95C255 100 260 110 260 120H240Z" fill="#0f5d52"/>
              <path d="M100 350V250C100 220 120 200 150 200H200V350H100Z" fill="#0f5d52"/>
              <path d="M300 350V200H350C380 200 400 220 400 250V350H300Z" fill="#0f5d52"/>
              <path d="M50 350H450" stroke="#0f5d52" strokeWidth="4"/>
              <path d="M130 200C130 170 145 150 150 140C155 150 170 170 170 200" fill="#0f5d52"/>
              <path d="M330 200C330 170 345 150 350 140C355 150 370 170 370 200" fill="#0f5d52"/>
              <circle cx="150" cy="138" r="8" fill="#d4a843"/>
              <circle cx="350" cy="138" r="8" fill="#d4a843"/>
              <circle cx="250" cy="93" r="10" fill="#d4a843"/>
            </svg>
          </div>

          {/* Couple silhouettes */}
          <div className="relative z-10 flex items-end gap-4 px-[30px] pb-[40px]">
            {/* Man */}
            <div className="text-center">
              <div className="w-[90px] h-[160px] bg-[linear-gradient(180deg,#1a4a3a_0%,#0d2d22_100%)] rounded-[50%_50%_0_0] relative">
                <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 w-[44px] h-[44px] rounded-full bg-[#c4956a]" />
              </div>
            </div>
            {/* Woman */}
            <div className="text-center">
              <div className="w-[80px] h-[150px] bg-[linear-gradient(180deg,#6b4c2a_0%,#4a3020_100%)] rounded-[50%_50%_0_0] relative">
                <div className="absolute -top-[25px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] rounded-full bg-[#c4956a]" />
                {/* Hijab */}
                <div className="absolute -top-[30px] left-1/2 -translate-x-1/2 w-[56px] h-[56px] rounded-[50%_50%_40%_40%] bg-[#8b6914]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quran verse card */}
        <div className="absolute -bottom-5 -left-2.5 bg-white rounded-2xl py-4 px-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-w-[220px] border border-[#e8ebe9] hidden sm:block">
          <p className="font-serif text-[14px] text-brand italic mb-1.5 leading-relaxed">
            "And We created you in pairs"
          </p>
          <p className="text-[11px] text-brand-muted font-semibold m-0">— Qur'an 78:8 ✦</p>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
