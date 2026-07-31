const SectionHeading = ({ eyebrow, title, description, align = "center" }) => (
  <div
    className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
  >
    {eyebrow && (
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700/80">
        {eyebrow}
      </p>
    )}
    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
        {description}
      </p>
    )}
  </div>
);

export default SectionHeading;
