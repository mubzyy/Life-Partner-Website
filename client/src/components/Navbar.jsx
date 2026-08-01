import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";
import Container from "./Container";

const publicLinks = [
  { label: "Home",            href: "#home"    },
  { label: "About Us",       href: "#why"     },
  { label: "Success Stories", href: "#stories" },
  { label: "Pricing",        href: "#pricing"  },
  { label: "Contact",        href: "#contact"  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #e8ebe9" }}>
      {/* Top info bar */}
      <div style={{ background: "#0f5d52", color: "#fff", fontSize: 12, fontWeight: 500, padding: "6px 24px" }} className="hidden sm:flex justify-between items-center w-full">
        <span className="hidden md:inline">🛡️ Trusted by thousands of families worldwide</span>
        <span style={{ display: "flex", gap: 24, margin: "0 auto", maxWidth: "100%", justifyContent: "center" }}>
          <span>Need help? +92 300 1234567</span>
          <span>support@lifepartner.com</span>
        </span>
      </div>

      {/* Main navbar */}
      <Container className="h-[72px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <img
            src={logo}
            alt="Life Partner"
            style={{ height: 52, width: 52, objectFit: "contain", display: "block" }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#0f5d52" }}>
              Life Partner
            </div>
            <div style={{ fontSize: 10, color: "#7a9490", fontWeight: 500 }}>Find your partner for life</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }} className="landing-nav-desktop">
          {publicLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontSize: 14, fontWeight: 600, color: "#334155", textDecoration: "none", padding: "4px 10px", borderRadius: 6, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0f5d52"}
              onMouseLeave={e => e.currentTarget.style.color = "#334155"}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="landing-cta-desktop">
          <Link to="/login" style={{
            padding: "9px 22px", borderRadius: 8, border: "1.5px solid #c8d4d0",
            fontSize: 13, fontWeight: 700, color: "#1e293b", textDecoration: "none", background: "#fff",
          }}>
            Login
          </Link>
          <Link to="/register" style={{
            padding: "9px 22px", borderRadius: 8,
            background: "linear-gradient(135deg, #0f5d52, #1a7a6e)",
            fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none",
            boxShadow: "0 4px 12px rgba(15,93,82,0.25)",
          }}>
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          className="landing-mobile-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 20px 16px" }}>
          {publicLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#334155", textDecoration: "none", marginBottom: 2 }}>
              {link.label}
            </a>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ padding: "10px", borderRadius: 8, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#334155", textDecoration: "none" }}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} style={{ padding: "10px", borderRadius: 8, background: "#0f5d52", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none" }}>Register</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .landing-nav-desktop, .landing-cta-desktop { display: none !important; }
        }
        @media (min-width: 901px) {
          .landing-mobile-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
