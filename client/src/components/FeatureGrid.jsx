const features = [
  {
    icon: "🛡️",
    title: "Verified Profiles",
    desc: "Every profile is manually verified for authenticity",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Your privacy is our priority. You're in safe hands",
  },
  {
    icon: "🤝",
    title: "Smart Matching",
    desc: "Advanced algorithm to find compatible life partners",
  },
  {
    icon: "🕌",
    title: "Islamic Values",
    desc: "Built on Islamic values and family principles",
  },
  {
    icon: "🔐",
    title: "Secure Platform",
    desc: "Enterprise-grade security for your peace of mind",
  },
  {
    icon: "❤️",
    title: "Trusted by Families",
    desc: "Thousands of families trust us worldwide",
  },
];

const FeatureGrid = () => (
  <section id="why" style={{ padding: "80px 24px", background: "#fff" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Section label */}
      <p style={{ textAlign: "center", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", color: "#d4a843", textTransform: "uppercase", marginBottom: 12 }}>
        WHY CHOOSE US
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", marginBottom: 60 }} className="feature-header-grid">
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#1a2e2b", margin: 0, lineHeight: 1.2 }}>
          A Better Way to<br />Find Your Partner
        </h2>
        <div />
      </div>

      {/* 6 feature cards in a single row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }} className="features-row">
        {features.map(f => (
          <div key={f.title} style={{
            background: "#fff",
            border: "1.5px solid #e8ebe9",
            borderRadius: 16,
            padding: "24px 16px",
            textAlign: "center",
            transition: "all 0.2s",
            cursor: "default",
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(15,93,82,0.12)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e2b", marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: "#6b8a86", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>

    <style>{`
      @media (max-width: 900px) {
        .features-row { grid-template-columns: repeat(3, 1fr) !important; }
        .feature-header-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 500px) {
        .features-row { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `}</style>
  </section>
);

export default FeatureGrid;
