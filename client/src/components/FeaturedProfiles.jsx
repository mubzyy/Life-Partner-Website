import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const profiles = [
  { name: "Ahmed",    age: 28, profession: "Software Engineer", city: "Lahore",     gender: "male"   },
  { name: "Ayesha",   age: 24, profession: "Doctor",            city: "Karachi",    gender: "female" },
  { name: "Usman",    age: 30, profession: "Business Analyst",  city: "Islamabad",  gender: "male"   },
  { name: "Zainab",   age: 25, profession: "Teacher",           city: "Faisalabad", gender: "female" },
  { name: "Hassan",   age: 29, profession: "Civil Engineer",    city: "Rawalpindi", gender: "male"   },
  { name: "Maria",    age: 23, profession: "Graphic Designer",  city: "Multan",     gender: "female" },
];

const avatarColors = [
  "#2d7a6e", "#6b4c8a", "#2d6e7e", "#7a6e2d", "#4c6e2d", "#7e2d2d"
];

const FeaturedProfiles = () => {
  const [start, setStart] = useState(0);
  const visible = 5;
  const canPrev = start > 0;
  const canNext = start + visible < profiles.length;

  return (
    <section id="profiles" className="py-[80px] bg-white overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-xs font-extrabold tracking-[0.15em] text-gold uppercase mb-3">
          FEATURED PROFILES
        </p>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="font-serif font-bold text-[#1a2e2b] m-0 text-3xl md:text-4xl lg:text-5xl">
            Meet Our Verified Members
          </h2>
          <button className="py-2.5 px-4.5 rounded-lg border-[1.5px] border-[#c8d8d4] text-[13px] font-bold text-brand bg-white cursor-pointer">
            View All Profiles
          </button>
        </div>

        {/* Slider */}
        <div className="relative">
          {canPrev && (
            <button onClick={() => setStart(s => s - 1)} className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-[1.5px] border-slate-200 bg-white cursor-pointer flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-10">
              <ChevronLeft size={18} color="#0f5d52" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-hidden">
            {profiles.slice(start, start + visible).map((p, i) => (
              <div key={p.name} className="rounded-2xl border-[1.5px] border-[#e8ebe9] overflow-hidden bg-white transition-all duration-200 hover:shadow-[0_8px_30px_rgba(15,93,82,0.12)] hover:-translate-y-1">
                {/* Photo placeholder */}
                <div 
                  className={`h-[180px] flex items-center justify-center relative bg-gradient-to-br from-[${avatarColors[(start + i) % avatarColors.length]}22] to-[${avatarColors[(start + i) % avatarColors.length]}44]`}
                >
                  {/* Avatar silhouette */}
                  <div 
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-[32px] text-white font-bold bg-[${avatarColors[(start + i) % avatarColors.length]}]`}
                  >
                    {p.name[0]}
                  </div>
                  {/* Verified badge */}
                  <div className="absolute bottom-2.5 left-2.5 bg-brand text-white rounded-md text-[10px] font-bold py-[3px] px-2 flex items-center gap-1">
                    ✓ Verified
                  </div>
                </div>

                <div className="pt-3.5 px-3.5 pb-4">
                  <div className="font-bold text-sm text-[#1a2e2b]">{p.name}, {p.age}</div>
                  <div className="text-xs text-[#6b8a86] mt-[3px]">{p.profession}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    📍 {p.city}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canNext && (
            <button onClick={() => setStart(s => s + 1)} className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-[1.5px] border-slate-200 bg-white cursor-pointer flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-10">
              <ChevronRight size={18} color="#0f5d52" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfiles;
