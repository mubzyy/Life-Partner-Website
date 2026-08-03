const steps = [
  { num: 1, title: "Register",         desc: "Create your profile in just a few minutes"       },
  { num: 2, title: "Complete Profile",  desc: "Add details about yourself and your preferences"  },
  { num: 3, title: "Find Matches",      desc: "We'll show you compatible matches"                },
  { num: 4, title: "Start Journey",     desc: "Connect, communicate and start your journey"      },
];

const HowItWorks = () => (
  <section id="how" className="py-[80px] bg-background overflow-hidden">
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-extrabold tracking-[0.15em] text-primary uppercase mb-3">
          HOW IT WORKS
        </p>
        <h2 className="font-serif font-bold text-text-primary m-0 mb-[60px] text-3xl md:text-5xl">
          Simple Steps to Find Your Life Partner
        </h2>

        {/* Steps with connecting lines */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Connecting line */}
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-border-light z-0 hidden md:block" />

          {steps.map((step, i) => (
            <div key={step.num} className="relative z-10 text-center">
              {/* Number circle */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
                i === 0 
                  ? "bg-primary text-white shadow-sm border-none" 
                  : "bg-card border-2 border-border-light shadow-sm"
              }`}>
                <span className="text-[20px]">
                  {["📋", "✅", "🔍", "💬"][i]}
                </span>
              </div>
              <h3 className="font-bold text-[15px] text-text-primary m-0 mb-2">
                {step.num}. {step.title}
              </h3>
              <p className="text-[13px] text-text-secondary font-medium leading-relaxed m-0">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
