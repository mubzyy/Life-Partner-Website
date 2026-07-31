import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const profiles = [
  { name: "Ahmed",    age: 28, profession: "Software Engineer", city: "Lahore",     gender: "male"   },
  { name: "Ayesha",   age: 24, profession: "Doctor",            city: "Karachi",    gender: "female" },
  { name: "Usman",    age: 30, profession: "Business Analyst",  city: "Islamabad",  gender: "male"   },
  { name: "Zainab",   age: 25, profession: "Teacher",           city: "Faisalabad", gender: "female" },
  { name: "Hassan",   age: 29, profession: "Civil Engineer",    city: "Rawalpindi", gender: "male"   },
  { name: "Maria",    age: 23, profession: "Graphic Designer",  city: "Multan",     gender: "female" },
];

const avatarColors = [
  "#2d7a6e", "#6b4c8a", "#2d6e7e", "#7a6e2d", "#4c6e2d", "#7e2d2d"
];

const FeaturedProfiles = () => {
  const [start, setStart] = useState(0);
  const visible = 5;
  const canPrev = start > 0;
  const canNext = start + visible < profiles.length;

  return (
    <section id="profiles" style={{ padding: "80px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", color: "#d4a843", textTransform: "uppercase", marginBottom: 12 }}>
          FEATURED PROFILES
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: "#1a2e2b", margin: 0 }}>
            Meet Our Verified Members
          </h2>
          <button style={{
            padding: "9px 18px", borderRadius: 8, border: "1.5px solid #c8d8d4",
            fontSize: 13, fontWeight: 700, color: "#0f5d52", background: "#fff", cursor: "pointer"
          }}>
            View All Profiles
          </button>
        </div>

        {/* Slider */}
        <div style={{ position: "relative" }}>
          {canPrev && (
            <button onClick={() => setStart(s => s - 1)} style={{
              position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #e2e8f0",
              background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 2,
            }}>
              <ChevronLeft size={18} color="#0f5d52" />
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, overflow: "hidden" }} className="profiles-grid">
            {profiles.slice(start, start + visible).map((p, i) => (
              <div key={p.name} style={{
                borderRadius: 16,
                border: "1.5px solid #e8ebe9",
                overflow: "hidden",
                background: "#fff",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(15,93,82,0.12)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Photo placeholder */}
                <div style={{
                  height: 180,
                  background: `linear-gradient(135deg, ${avatarColors[(start + i) % avatarColors.length]}22, ${avatarColors[(start + i) % avatarColors.length]}44)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  {/* Avatar silhouette */}
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: avatarColors[(start + i) % avatarColors.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, color: "#fff", fontWeight: 700,
                  }}>
                    {p.name[0]}
                  </div>
                  {/* Verified badge */}
                  <div style={{
                    position: "absolute", bottom: 10, left: 10,
                    background: "#0f5d52", color: "#fff", borderRadius: 6,
                    fontSize: 10, fontWeight: 700, padding: "3px 8px",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    ✓ Verified
                  </div>
                </div>

                <div style={{ padding: "14px 14px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e2b" }}>{p.name}, {p.age}</div>
                  <div style={{ fontSize: 12, color: "#6b8a86", marginTop: 3 }}>{p.profession}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    📍 {p.city}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canNext && (
            <button onClick={() => setStart(s => s + 1)} style={{
              position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #e2e8f0",
              background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 2,
            }}>
              <ChevronRight size={18} color="#0f5d52" />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .profiles-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .profiles-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
};

export default FeaturedProfiles;
