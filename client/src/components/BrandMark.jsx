import { HeartHandshake } from "lucide-react";

// hideTextOnMobile: overflow protection for headers whose icon cluster
// already fills a narrow viewport (AppLayout, SiteHeader) — below 420px the
// wordmark collapses to just the icon so the header never forces horizontal
// page scroll. Opt-in only: existing usages (Navbar, and compact={false})
// are completely unaffected unless they explicitly pass this prop.
const BrandMark = ({ compact = false, className = "", hideTextOnMobile = false }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm shrink-0">
      <HeartHandshake className="h-5 w-5" />
    </div>
    <div className={`leading-tight ${hideTextOnMobile ? "hidden min-[420px]:block" : ""}`}>
      <div className="font-bold text-2xl tracking-wide text-text-primary whitespace-nowrap">
        Life Partner
      </div>
      {!compact && (
        <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Where trust meets love
        </div>
      )}
    </div>
  </div>
);

export default BrandMark;
