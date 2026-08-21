import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

// Small reusable dropdown — click the trigger, pick an option, closes on
// outside click. Used anywhere a "Sort by" / period-style control needs to
// actually do something instead of just rendering a chevron.
const SimpleDropdown = ({ icon: Icon, label, options, value, onChange, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-slate-50 shadow-sm w-full">
        {Icon && <Icon size={15} className="text-slate-500 shrink-0" />}
        <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">{label ? `${label} ` : ""}{current?.label}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ml-auto ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[13px] font-medium cursor-pointer bg-transparent border-none transition-colors ${opt.value === value ? "text-[#E91E63] bg-pink-50" : "text-slate-700 hover:bg-slate-50"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleDropdown;
