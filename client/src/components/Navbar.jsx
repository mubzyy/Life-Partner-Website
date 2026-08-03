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
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8ebe9]">
      {/* Top info bar */}
      <div className="bg-brand text-white text-[12px] font-medium px-6 py-[6px] hidden sm:flex justify-between items-center w-full">
        <span className="hidden md:inline">🛡️ Trusted by thousands of families worldwide</span>
        <span className="flex gap-6 mx-auto max-w-full justify-center">
          <span>Need help? +92 300 1234567</span>
          <span>support@lifepartner.com</span>
        </span>
      </div>

      {/* Main navbar */}
      <Container className="h-[72px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
          <img
            src={logo}
            alt="Life Partner"
            className="h-[52px] w-[52px] object-contain block"
          />
          <div className="leading-[1.2]">
            <div className="font-serif text-[22px] font-bold text-brand">
              Life Partner
            </div>
            <div className="text-[10px] text-brand-muted font-medium">Find your partner for life</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-[901px]:flex items-center gap-2">
          {publicLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-semibold text-slate-700 no-underline px-[10px] py-1 rounded-md transition-colors duration-150 hover:text-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden min-[901px]:flex items-center gap-2.5">
          <Link to="/login" className="px-[22px] py-[9px] rounded-lg border-[1.5px] border-[#c8d4d0] text-[13px] font-bold text-slate-800 no-underline bg-white">
            Login
          </Link>
          <Link to="/register" className="px-[22px] py-[9px] rounded-lg bg-gradient-to-br from-brand to-brand-mid text-[13px] font-bold text-white no-underline shadow-[0_4px_12px_rgba(15,93,82,0.25)]">
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="min-[901px]:hidden w-10 h-10 rounded-full border-[1.5px] border-slate-200 bg-white flex items-center justify-center cursor-pointer"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-white border-t border-slate-100 px-5 pt-3 pb-4 min-[901px]:hidden">
          {publicLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 no-underline mb-0.5">
              {link.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg border-[1.5px] border-slate-200 text-center text-[13px] font-bold text-slate-700 no-underline">Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="p-2.5 rounded-lg bg-brand text-center text-[13px] font-bold text-white no-underline">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
