import { Crown, Heart, Filter, Eye, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "./Container";

const Pricing = () => (
  <section id="pricing" style={{ padding: "80px 0", background: "#fff" }} className="overflow-hidden">
    <Container>
      <div className="max-w-5xl mx-auto">
        {/* Premium banner matching the design */}
        <div style={{
          background: "linear-gradient(135deg, #0b3d35 0%, #0f5d52 60%, #1a7a6e 100%)",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
        }} className="p-8 md:p-12 lg:p-14 flex flex-col md:flex-row gap-8 md:gap-12 items-center">

          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -40, right: 200, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: 100, width: 250, height: 250, borderRadius: "50%", background: "rgba(212,168,67,0.08)", pointerEvents: "none" }} />

          <div className="flex-1">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Crown size={20} color="#d4a843" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#d4a843", letterSpacing: "0.08em" }}>UPGRADE TO PREMIUM</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }} className="text-3xl md:text-4xl lg:text-5xl">
              Unlock Premium Features
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 28px", lineHeight: 1.6 }}>
              Get unlimited access, priority support and advanced features to find your perfect life partner faster.
            </p>

            {/* Feature icons row */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { icon: Heart,       label: "Unlimited\nMatches"  },
                { icon: Filter,      label: "Advanced\nFilters"   },
                { icon: Eye,         label: "See Who\nLikes You"  },
                { icon: Headphones,  label: "Priority\nSupport"   },
              ].map(f => (
                <div key={f.label} style={{ textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    <f.icon size={20} color="#d4a843" />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600, whiteSpace: "pre-line", textAlign: "center" }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right CTA */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <Link to="/subscription" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #d4a843, #c89832)",
              color: "#fff", textDecoration: "none",
              padding: "16px 28px", borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              boxShadow: "0 6px 20px rgba(212,168,67,0.4)",
              whiteSpace: "nowrap",
            }}>
              View Plans & Pricing →
            </Link>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>Starting from PKR 999/month</p>
          </div>
        </div>
      </div>
    </Container>
  </section>
);

export default Pricing;
