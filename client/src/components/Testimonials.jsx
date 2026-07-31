import { useState } from "react";
import { ChevronRight } from "lucide-react";

const stories = [
  {
    quote: "Life Partner helped me find not just a partner, but a companion who shares my values and understands my deen. Alhamdulillah!",
    couple: "Maryam & Abdullah",
    date: "Married April 2024",
  },
  {
    quote: "The platform is so professional and respectful. My family felt comfortable from the very beginning. Highly recommended!",
    couple: "Fatima & Hamza",
    date: "Married March 2024",
  },
  {
    quote: "JazakAllah to the entire Life Partner team. They are making a difference in people's lives. May Allah bless you all.",
    couple: "Aisha & Bilal",
    date: "Married May 2024",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);

  return (
    <section id="stories" style={{ padding: "80px 24px", background: "#f7f5f0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <p style={{ textAlign: "center", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", color: "#d4a843", textTransform: "uppercase", marginBottom: 12 }}>
          SUCCESS STORIES
        </p>
        <h2 style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: "#1a2e2b", margin: "0 0 48px" }}>
          Alhamdulillah, They Found Their Life Partners
        </h2>

        {/* 3 side-by-side testimonial cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }} className="testimonials-grid">
          {stories.map((s, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 24px",
              border: "1.5px solid #e8ebe9",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              position: "relative",
            }}>
              {/* Quote mark */}
              <div style={{ fontSize: 48, lineHeight: 1, color: "#0f5d5220", fontFamily: "serif", marginBottom: 8 }}>"</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4a6360", margin: "0 0 24px", fontStyle: "italic" }}>
                "{s.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  💑
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e2b" }}>– {s.couple}</div>
                  <div style={{ fontSize: 12, color: "#7a9490", marginTop: 2 }}>{s.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {stories.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{
                width: i === active ? 28 : 10,
                height: 10,
                borderRadius: 999,
                background: i === active ? "#0f5d52" : "#c8d8d4",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              aria-label={`Story ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
