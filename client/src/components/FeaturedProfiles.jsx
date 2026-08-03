import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const profiles = [
  { name: "Ahmed",    age: 28, profession: "Software Engineer", city: "Lahore",     gender: "male", image: "/images/profile_m1.jpg"   },
  { name: "Ayesha",   age: 24, profession: "Doctor",            city: "Karachi",    gender: "female", image: "/images/profile_f1.jpg" },
  { name: "Usman",    age: 30, profession: "Business Analyst",  city: "Islamabad",  gender: "male", image: "/images/profile_m1.jpg"   },
  { name: "Zainab",   age: 25, profession: "Teacher",           city: "Faisalabad", gender: "female", image: "/images/profile_f2.jpg" },
  { name: "Hassan",   age: 29, profession: "Civil Engineer",    city: "Rawalpindi", gender: "male", image: "/images/profile_m1.jpg"   },
  { name: "Maria",    age: 23, profession: "Graphic Designer",  city: "Multan",     gender: "female", image: "/images/profile_f3.jpg" },
];

const FeaturedProfiles = () => {
  const [start, setStart] = useState(0);
  const visible = 5;
  const canPrev = start > 0;
  const canNext = start + visible < profiles.length;

  return (
    <section id="profiles" className="py-[80px] bg-background overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-xs font-bold tracking-[0.15em] text-primary uppercase mb-3">
          FEATURED PROFILES
        </p>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="font-serif font-bold text-text-primary m-0 text-3xl md:text-4xl lg:text-5xl">
            Meet Our Verified Members
          </h2>
          <button className="py-2.5 px-4.5 rounded-xl border border-border-light text-[13px] font-bold text-primary bg-card cursor-pointer hover:bg-primary hover:text-white transition-all shadow-sm">
            View All Profiles
          </button>
        </div>

        {/* Slider */}
        <div className="relative">
          {canPrev && (
            <button onClick={() => setStart(s => s - 1)} className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-light bg-card cursor-pointer flex items-center justify-center shadow-sm z-10 hover:scale-105 transition-all text-primary">
              <ChevronLeft size={18} className="text-primary" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-hidden">
            {profiles.slice(start, start + visible).map((p, i) => (
              <div key={p.name} className="rounded-2xl border border-border-light shadow-sm overflow-hidden bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                {/* Photo */}
                <div 
                  className="h-[180px] flex items-center justify-center relative bg-primary-very-light overflow-hidden"
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {/* Verified badge */}
                  <div className="absolute bottom-2.5 left-2.5 bg-primary text-white rounded-md text-[10px] font-bold py-[3px] px-2 flex items-center gap-1 shadow-sm z-10">
                    ✓ Verified
                  </div>
                </div>

                <div className="pt-3.5 px-3.5 pb-4">
                  <div className="font-bold text-sm text-text-primary">{p.name}, {p.age}</div>
                  <div className="text-xs text-text-secondary font-medium mt-[3px]">{p.profession}</div>
                  <div className="text-[11px] text-text-muted font-medium mt-1 flex items-center gap-1">
                    📍 {p.city}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canNext && (
            <button onClick={() => setStart(s => s + 1)} className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-light bg-card cursor-pointer flex items-center justify-center shadow-sm z-10 hover:scale-105 transition-all text-primary">
              <ChevronRight size={18} className="text-primary" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfiles;
