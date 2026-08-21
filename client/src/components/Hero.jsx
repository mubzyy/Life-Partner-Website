import { Heart, Shield, Users, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => (
  <section
    id="home"
    className="relative overflow-hidden bg-primary-very-light pt-[80px] pb-[60px]"
  >
    <div className="w-full max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center relative z-10">

      {/* ── Left column ── */}
      <div>
        <h1 className="font-serif leading-[1.08] text-text-primary mb-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
          Find Your<br />
          <span className="text-primary">Life Partner</span>
        </h1>

        <p className="text-text-secondary max-w-[440px] mb-8 text-base md:text-lg leading-relaxed font-medium">
          A trusted Muslim matrimonial platform where serious individuals connect with their perfect life partner, with the blessings of faith and family.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-[14px] flex-wrap mb-10">
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white no-underline px-7 py-3.5 rounded-xl text-[15px] font-bold shadow-sm hover:scale-105 transition-all">
            <Heart size={17} fill="white" />
            Find Your Life Partner
          </Link>
          <Link to="/register" className="inline-flex items-center gap-2 bg-card text-text-primary border border-border-light no-underline px-7 py-3.5 rounded-xl text-[15px] font-bold hover:scale-105 transition-all shadow-sm">
            <span className="text-base">👤</span>
            Create Profile
          </Link>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🛡️", label: "100%",    sub: "Verified Profiles"   },
            { icon: "🔒", label: "Privacy", sub: "Guaranteed"          },
            { icon: "🤍", label: "50k+",    sub: "Successful Matches"  },
            { icon: "🕐", label: "24/7",    sub: "Support"             },
          ].map(b => (
            <div key={b.label} className="text-center">
              <div className="text-[20px] mb-1">{b.icon}</div>
              <div className="font-bold text-[15px] text-text-primary">{b.label}</div>
              <div className="text-[11px] text-text-secondary font-medium">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right column — hero image + Quran verse card ── */}
      <div className="relative flex justify-center w-full">
        {/* Soft glow behind the photo for depth */}
        <div className="absolute w-[85%] h-[85%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/20 rounded-full blur-[80px] -z-10" />

        <div className="w-full max-w-[500px] aspect-[4/3.2] rounded-2xl overflow-hidden bg-card border border-border-light flex items-center justify-center relative shadow-lg">
          {/* Hero Image */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/images/couple_hero.jpg"
              alt="Beautiful Muslim couple"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Quran verse card */}
        <div className="absolute -bottom-8 -left-4 md:-left-8 max-w-[290px] hidden sm:block z-20">
          <div className="relative bg-gradient-to-br from-card to-primary-very-light rounded-[22px] py-6 px-6 pt-8 shadow-[0_20px_45px_-12px_rgba(233,30,99,0.35)] border border-primary-light/40">
            {/* Gold ornamental rule */}
            <div className="absolute top-4 right-6 h-px w-10 bg-gradient-to-r from-transparent to-[#d4af37]" />

            {/* Icon seal, pinned to the card's top edge */}
            <div className="absolute -top-5 left-6 w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-[0_6px_16px_-2px_rgba(233,30,99,0.55)] ring-4 ring-card">
              <Sparkles size={18} className="text-white" />
            </div>

            {/* Decorative background quote mark */}
            <span className="absolute top-1 left-4 text-[64px] leading-none font-serif text-primary/10 select-none pointer-events-none">"</span>

            <p className="relative font-serif text-[20px] md:text-[22px] text-primary italic mb-2 leading-relaxed font-bold">
              And We created you in pairs
            </p>
            <p className="relative text-[12px] md:text-[13px] text-text-secondary font-bold m-0 tracking-wide">— Qur'an 78:8 ✦</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
