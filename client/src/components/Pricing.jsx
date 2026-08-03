import { Crown, Heart, Filter, Eye, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => (
  <section id="pricing" className="py-[80px] bg-background overflow-hidden">
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Premium banner matching the design */}
        <div className="bg-primary-very-light border border-primary rounded-2xl relative overflow-hidden p-8 md:p-12 lg:p-14 flex flex-col md:flex-row gap-8 md:gap-12 items-center shadow-sm">

          {/* Decorative circles */}
          <div className="absolute -top-10 right-[200px] w-[200px] h-[200px] rounded-full bg-primary/5 pointer-events-none" />
          <div className="absolute -bottom-[60px] right-[100px] w-[250px] h-[250px] rounded-full bg-primary/10 pointer-events-none" />

          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-2.5">
              <Crown size={20} className="text-primary" />
              <span className="text-[13px] font-bold text-primary tracking-[0.08em]">UPGRADE TO PREMIUM</span>
            </div>
            <h2 className="font-serif font-bold text-text-primary m-0 mb-4 leading-tight text-3xl md:text-4xl lg:text-5xl">
              Unlock Premium Features
            </h2>
            <p className="text-sm font-medium text-text-secondary m-0 mb-7 leading-relaxed">
              Get unlimited access, priority support and advanced features to find your perfect life partner faster.
            </p>

            {/* Feature icons row */}
            <div className="flex gap-8 flex-wrap">
              {[
                { icon: Heart,       label: "Unlimited\nMatches"  },
                { icon: Filter,      label: "Advanced\nFilters"   },
                { icon: Eye,         label: "See Who\nLikes You"  },
                { icon: Headphones,  label: "Priority\nSupport"   },
              ].map(f => (
                <div key={f.label} className="text-center">
                  <div className="w-11 h-11 rounded-xl bg-white border border-border-light shadow-sm flex items-center justify-center mx-auto mb-2">
                    <f.icon size={20} className="text-primary" />
                  </div>
                  <div className="text-[11px] text-text-secondary font-semibold whitespace-pre-line text-center">{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right CTA */}
          <div className="text-center shrink-0 relative z-10">
            <Link to="/subscription" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all no-underline py-4 px-7 text-sm font-bold whitespace-nowrap">
              View Plans & Pricing →
            </Link>
            <p className="text-xs font-medium text-text-muted mt-2.5">Starting from PKR 999/month</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Pricing;
