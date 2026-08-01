import Container from "./Container";

const steps = [
  { num: 1, title: "Register",         desc: "Create your profile in just a few minutes"       },
  { num: 2, title: "Complete Profile",  desc: "Add details about yourself and your preferences"  },
  { num: 3, title: "Find Matches",      desc: "We'll show you compatible matches"                },
  { num: 4, title: "Start Journey",     desc: "Connect, communicate and start your journey"      },
];

const HowItWorks = () => (
  <section id="how" style={{ padding: "80px 0", background: "#f7f5f0" }} className="overflow-hidden">
    <Container>
      <div className="max-w-4xl mx-auto text-center">
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", color: "#d4a843", textTransform: "uppercase", marginBottom: 12 }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#1a2e2b", margin: "0 0 60px" }} className="text-3xl md:text-5xl">
          Simple Steps to Find Your Life Partner
        </h2>

        {/* Steps with connecting lines */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Connecting line */}
          <div style={{
            position: "absolute",
            top: 28,
            left: "12.5%",
            right: "12.5%",
            height: 2,
            background: "linear-gradient(90deg, #0f5d52, #d4a843)",
            zIndex: 0,
          }} className="hidden md:block" />

          {steps.map((step, i) => (
            <div key={step.num} style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              {/* Number circle */}
              <div style={{
                width: 56, height: 56,
                borderRadius: "50%",
                background: i === 0 ? "linear-gradient(135deg, #0f5d52, #1a7a6e)" : "#fff",
                border: i === 0 ? "none" : "2px solid #c8d8d4",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: i === 0 ? "0 6px 20px rgba(15,93,82,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
              }}>
                <span style={{ fontSize: 20 }}>
                  {["📋", "✅", "🔍", "💬"][i]}
                </span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: "#1a2e2b", margin: "0 0 8px" }}>
                {step.num}. {step.title}
              </h3>
              <p style={{ fontSize: 13, color: "#6b8a86", lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  </section>
);

export default HowItWorks;
