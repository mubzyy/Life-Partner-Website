import { Link } from "react-router-dom";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";

const Footer = () => (
  <footer id="contact" style={{ background: "#0b1f1c", color: "#fff", padding: "60px 24px 0" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* 5 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1.3fr", gap: 40, marginBottom: 40 }} className="footer-grid">

        {/* Logo + desc + socials */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <img src={logo} alt="Life Partner" style={{ height: 46, width: 46, objectFit: "contain", display: "block" }} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>Life Partner</div>
              <div style={{ fontSize: 10, color: "#6a9490" }}>Find your partner for life</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#8aafab", lineHeight: 1.7, marginBottom: 20, maxWidth: 260 }}>
            A trusted platform for Muslim matrimonials. Building halal relationships with trust and respect.
          </p>
          {/* Social icons */}
          <div style={{ display: "flex", gap: 10 }}>
            {["f", "IG", "tw", "yt", "in"].map(s => (
              <a key={s} href="#" style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "#8aafab", textDecoration: "none",
              }}>{s}</a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Quick Links</h3>
          {["About Us", "How It Works", "Success Stories", "Blog", "Contact Us"].map(l => (
            <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "#8aafab", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#8aafab"}
            >{l}</a>
          ))}
        </div>

        {/* For Members */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>For Members</h3>
          {["Search Profiles", "Membership Plans", "Safety Tips", "Privacy Policy", "Terms of Service"].map(l => (
            <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "#8aafab", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#8aafab"}
            >{l}</a>
          ))}
        </div>

        {/* Support */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Support</h3>
          {["Help Center", "Contact Support", "Report an Issue", "Community Guidelines", "FAQs"].map(l => (
            <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "#8aafab", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#8aafab"}
            >{l}</a>
          ))}
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Contact Info</h3>
          {[
            { icon: "📞", text: "+92 300 1234567"                       },
            { icon: "📧", text: "support@lifepartner.com"               },
            { icon: "📍", text: "123, Muslim Town, Lahore,\nPunjab, Pakistan" },
          ].map(c => (
            <div key={c.icon} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>{c.icon}</span>
              <span style={{ fontSize: 13, color: "#8aafab", lineHeight: 1.5, whiteSpace: "pre-line" }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 12, color: "#5a7a76", margin: 0 }}>© 2024 Life Partner. All rights reserved.</p>
        <p style={{ fontSize: 12, color: "#5a7a76", margin: 0 }}>Made with ❤️ for the Muslim Ummah</p>
      </div>
    </div>

    <style>{`
      @media (max-width: 900px) {
        .footer-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 500px) {
        .footer-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </footer>
);

export default Footer;
