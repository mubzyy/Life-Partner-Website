import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";
import { faqItems } from "../data/siteContent";

const FaqAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="faq" className="bg-white py-20 lg:py-28">
      <Container>
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
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-lg font-semibold text-slate-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-6 text-base leading-7 text-slate-600">
                    {item.answer}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default FaqAccordion;
