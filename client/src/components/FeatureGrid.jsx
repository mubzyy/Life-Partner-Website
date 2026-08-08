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
    icon: "🤍",
    title: "Trusted by Families",
    desc: "Thousands of families trust us worldwide",
  },
];

const FeatureGrid = () => (
  <section id="why" className="py-[80px] bg-background overflow-hidden">
    <div className="w-full max-w-[1400px] mx-auto px-4">
      {/* Section label */}
      <p className="text-center text-xs font-bold tracking-[0.15em] text-primary uppercase mb-3">
        WHY CHOOSE US
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
        <h2 className="font-serif font-bold text-text-primary m-0 leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center md:text-left">
          A Better Way to<br />Find Your Partner
        </h2>
        <div />
      </div>

      {/* 6 feature cards in a single row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {features.map(f => (
          <div key={f.title} className="bg-card border border-border-light shadow-sm rounded-2xl py-6 px-4 text-center transition-all duration-200 cursor-default hover:shadow-md hover:-translate-y-1">
            <div className="text-[32px] mb-3">{f.icon}</div>
            <div className="font-bold text-[13px] text-text-primary mb-2">{f.title}</div>
            <div className="text-[11px] text-text-secondary font-medium leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureGrid;
