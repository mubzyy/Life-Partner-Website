import { ChevronDown } from "lucide-react";
import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { faqItems } from "../data/siteContent";

const FaqAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="faq" className="bg-background py-20 lg:py-28">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Straight answers for people who want clarity before they commit."
          description="The accordion keeps the information dense enough to be useful while still feeling airy and premium."
        />

        <div className="mx-auto mt-12 max-w-4xl space-y-4">
          {faqItems.map((item, index) => {
            const open = index === activeIndex;

            return (
              <article
                key={item.question}
                className="rounded-2xl border border-border-light bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-lg font-bold text-text-primary">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180 text-primary" : "text-text-muted"}`}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-6 text-base font-medium leading-7 text-text-secondary">
                    {item.answer}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
