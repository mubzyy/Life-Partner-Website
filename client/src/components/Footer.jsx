import { Link } from "react-router-dom";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";
import Container from "./Container";

const Footer = () => (
  <footer id="contact" className="bg-card text-text-primary pt-[60px] pb-4 border-t border-border-light">
    <Container>

      {/* 5 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1.2fr_1.2fr_1.3fr] gap-10 mb-10">

        {/* Logo + desc + socials */}
        <div>
          <div className="flex items-center gap-2.5 mb-3.5">
            <img src={logo} alt="Life Partner" className="h-[46px] w-[46px] object-contain block" />
            <div>
              <div className="font-serif text-[18px] font-bold text-text-primary">Life Partner</div>
              <div className="text-[10px] text-text-muted font-medium">Find your partner for life</div>
            </div>
          </div>
          <p className="text-[13px] text-text-secondary font-medium leading-[1.7] mb-5 max-w-[260px]">
            A trusted platform for Muslim matrimonials. Building halal relationships with trust and respect.
          </p>
          {/* Social icons */}
          <div className="flex gap-2.5">
            {["f", "IG", "tw", "yt", "in"].map(s => (
              <a key={s} href="#" className="w-[34px] h-[34px] rounded-full border border-border-light bg-background flex items-center justify-center text-[10px] font-bold text-text-secondary hover:text-primary hover:border-primary no-underline transition-colors">{s}</a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-[14px] font-bold text-text-primary mb-4">Quick Links</h3>
          {["About Us", "How It Works", "Success Stories", "Blog", "Contact Us"].map(l => (
            <a key={l} href="#" className="block text-[13px] font-medium text-text-secondary no-underline mb-2.5 transition-colors duration-150 hover:text-primary"
            >{l}</a>
          ))}
        </div>

        {/* For Members */}
        <div>
          <h3 className="text-[14px] font-bold text-text-primary mb-4">For Members</h3>
          {["Search Profiles", "Membership Plans", "Safety Tips", "Privacy Policy", "Terms of Service"].map(l => (
            <a key={l} href="#" className="block text-[13px] font-medium text-text-secondary no-underline mb-2.5 transition-colors duration-150 hover:text-primary"
            >{l}</a>
          ))}
        </div>

        {/* Support */}
        <div>
          <h3 className="text-[14px] font-bold text-text-primary mb-4">Support</h3>
          {["Help Center", "Contact Support", "Report an Issue", "Community Guidelines", "FAQs"].map(l => (
            <a key={l} href="#" className="block text-[13px] font-medium text-text-secondary no-underline mb-2.5 transition-colors duration-150 hover:text-primary"
            >{l}</a>
          ))}
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-[14px] font-bold text-text-primary mb-4">Contact Info</h3>
          {[
            { icon: "📞", text: "+92 300 1234567"                       },
            { icon: "📧", text: "support@lifepartner.com"               },
            { icon: "📍", text: "123, Muslim Town, Lahore,\nPunjab, Pakistan" },
          ].map(c => (
            <div key={c.icon} className="flex gap-2.5 mb-3.5 items-start">
              <span className="text-[14px] mt-[1px]">{c.icon}</span>
              <span className="text-[13px] font-medium text-text-secondary leading-snug whitespace-pre-line">{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-[18px] border-t border-border-light">
        <p className="text-[12px] font-medium text-text-muted m-0">© 2024 Life Partner. All rights reserved.</p>
        <p className="text-[12px] font-medium text-text-muted m-0">Made with ❤️ for the Muslim Ummah</p>
      </div>
    </Container>
  </footer>
);

export default Footer;
