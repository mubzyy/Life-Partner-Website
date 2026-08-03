import { useState } from "react";

const stories = [
  {
    quote: "Life Partner helped me find not just a partner, but a companion who shares my values and understands my deen. Alhamdulillah!",
    couple: "Maryam & Abdullah",
    date: "Married April 2024",
  },
  {
    quote: "The platform is so professional and respectful. My family felt comfortable from the very beginning. Highly recommended!",
    couple: "Fatima & Hamza",
    date: "Married March 2024",
  },
  {
    quote: "JazakAllah to the entire Life Partner team. They are making a difference in people's lives. May Allah bless you all.",
    couple: "Aisha & Bilal",
    date: "Married May 2024",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);

  return (
    <section id="stories" className="py-[80px] bg-background overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-extrabold tracking-[0.15em] text-primary uppercase mb-3">
            SUCCESS STORIES
          </p>
          <h2 className="text-center font-serif font-bold text-text-primary m-0 mb-12 text-3xl md:text-5xl">
            Alhamdulillah, They Found Their Life Partners
          </h2>

          {/* 3 side-by-side testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stories.map((s, i) => (
              <div key={i} className="bg-card rounded-2xl py-7 px-6 border border-border-light shadow-sm relative">
                {/* Quote mark */}
                <div className="text-[48px] leading-none text-primary-light font-serif mb-2">"</div>
                <p className="text-sm font-medium leading-relaxed text-text-secondary m-0 mb-6 italic">
                  "{s.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-very-light flex items-center justify-center text-lg shrink-0 text-primary">
                    💑
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-primary">– {s.couple}</div>
                    <div className="text-xs text-text-muted mt-0.5 font-medium">{s.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2">
            {stories.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                  i === active ? "w-7 bg-primary" : "w-2.5 bg-border-light"
                }`}
                aria-label={`Story ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
