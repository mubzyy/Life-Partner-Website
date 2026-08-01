import { Heart, Shield, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "./Container";

const trustBadges = [
  { icon: Shield, label: "100%", sub: "Verified Profiles" },
  { icon: Shield, label: "Privacy", sub: "Guaranteed" },
  { icon: Heart,  label: "50k+",   sub: "Successful Matches" },
  { icon: Clock,  label: "24/7",   sub: "Support" },
];

const Hero = () => (
  <section
    id="home"
    className="relative overflow-hidden"
    style={{
      background: "linear-gradient(135deg, #f7f5f0 0%, #eef6f4 50%, #f5f0e8 100%)",
      padding: "80px 0 60px",
    }}
  >
    {/* Decorative blobs */}
    <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(15,93,82,0.06)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(212,168,67,0.07)", pointerEvents: "none" }} />

    <Container className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center relative z-10">

      {/* ── Left column ── */}
      <div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          lineHeight: 1.08,
          color: "#1a2e2b",
          margin: "0 0 20px",
        }} className="text-5xl sm:text-6xl md:text-7xl font-bold">
          Find Your<br />
          <span style={{ color: "#0f5d52" }}>Life Partner</span>
        </h1>

        <p style={{ color: "#4a6360", maxWidth: 440, margin: "0 0 32px" }} className="text-base md:text-lg leading-relaxed">
          A trusted Muslim matrimonial platform where serious individuals connect with their perfect life partner, with the blessings of faith and family.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
          <Link to="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
            color: "#fff", textDecoration: "none",
            padding: "14px 28px", borderRadius: 10,
            fontSize: 15, fontWeight: 700,
            boxShadow: "0 6px 20px rgba(15,93,82,0.3)",
          }}>
            <Heart size={17} fill="white" />
            Find Your Life Partner
          </Link>
          <Link to="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", color: "#1e293b",
            border: "1.5px solid #d0dcd8",
            textDecoration: "none",
            padding: "14px 28px", borderRadius: 10,
            fontSize: 15, fontWeight: 700,
          }}>
            <span style={{ fontSize: 16 }}>👤</span>
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
            <div key={b.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2e2b" }}>{b.label}</div>
              <div style={{ fontSize: 11, color: "#6b8a86", fontWeight: 500 }}>{b.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right column — hero image + Quran verse card ── */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }} className="w-full">
        <div style={{
          width: "100%",
          maxWidth: 500,
          aspectRatio: "4/3.2",
          borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(135deg, #d4e8e3 0%, #e8d5b0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: "0 20px 60px rgba(15,93,82,0.15)",
        }}>
          {/* Decorative mosque silhouette */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 500 350" style={{ width: "100%", height: "100%", opacity: 0.15 }}>
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
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", gap: 16, padding: "0 30px 40px" }}>
            {/* Man */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 90, height: 160,
                background: "linear-gradient(180deg, #1a4a3a 0%, #0d2d22 100%)",
                borderRadius: "50% 50% 0 0",
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", width: 44, height: 44, borderRadius: "50%", background: "#c4956a" }} />
              </div>
            </div>
            {/* Woman */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 150,
                background: "linear-gradient(180deg, #6b4c2a 0%, #4a3020 100%)",
                borderRadius: "50% 50% 0 0",
                position: "relative",
              }}>
                <div style={{ position: "absolute", top: -25, left: "50%", transform: "translateX(-50%)", width: 40, height: 40, borderRadius: "50%", background: "#c4956a" }} />
                {/* Hijab */}
                <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50% 50% 40% 40%", background: "#8b6914" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quran verse card */}
        <div style={{
          position: "absolute",
          bottom: -20,
          left: -10,
          background: "#fff",
          borderRadius: 16,
          padding: "16px 20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          maxWidth: 220,
          border: "1px solid #e8ebe9",
        }} className="hidden sm:block">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "#0f5d52", fontStyle: "italic", margin: "0 0 6px", lineHeight: 1.5 }}>
            "And We created you in pairs"
          </p>
          <p style={{ fontSize: 11, color: "#7a9490", fontWeight: 600, margin: 0 }}>— Qur'an 78:8 ✦</p>
        </div>
      </div>
    </Container>
  </section>
);

export default Hero;
