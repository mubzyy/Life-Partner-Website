import { Menu, X } from "lucide-react";
import BrandMark from "./BrandMark";
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
    <header className="sticky top-0 z-50 bg-white border-b border-border-light">
      {/* Top info bar */}
      <div className="bg-primary text-white text-[12px] font-medium px-6 py-[6px] hidden sm:flex justify-between items-center w-full">
        <span className="hidden md:inline">🛡️ Trusted by thousands of families worldwide</span>
        <span className="flex gap-6 mx-auto max-w-full justify-center">
          <span>Need help? +92 300 1234567</span>
          <span>support@lifepartner.com</span>
        </span>
      </div>

      {/* Main navbar */}
      <Container className="h-[72px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90">
          <BrandMark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-[901px]:flex items-center gap-2">
          {publicLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-semibold text-text-secondary no-underline px-[10px] py-1 rounded-md transition-colors duration-150 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden min-[901px]:flex items-center gap-2.5">
          <Link to="/login" className="px-[22px] py-[9px] rounded-xl border-[1.5px] border-border-light text-[13px] font-bold text-text-primary no-underline bg-white hover:bg-slate-50 transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-[22px] py-[9px] rounded-xl bg-primary hover:bg-primary-hover text-[13px] font-bold text-white no-underline shadow-sm hover:scale-105 transition-all">
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="min-[901px]:hidden w-10 h-10 rounded-full border-[1.5px] border-border-light bg-white flex items-center justify-center cursor-pointer text-text-secondary"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-card border-t border-border-light px-5 pt-3 pb-4 min-[901px]:hidden">
          {publicLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-text-secondary no-underline mb-0.5 hover:bg-slate-50">
              {link.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-xl border-[1.5px] border-border-light text-center text-[13px] font-bold text-text-primary no-underline bg-white hover:bg-slate-50">Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-center text-[13px] font-bold text-white no-underline shadow-sm">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
