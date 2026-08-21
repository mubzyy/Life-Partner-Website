import { HeartHandshake } from "lucide-react";

// CRM-only brand mark. Same mark/layout as the main site's BrandMark, but
// the icon badge is rendered in the CRM's own green instead of the site's
// pink — the pink badge looked out of place sitting inside the sidebar's
// white logo box on top of the dark green sidebar. Kept as its own
// component (rather than a prop on BrandMark) so the website's brand mark
// is never at risk of being touched by CRM-only styling.
const AdminBrandMark = ({ compact = false, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div
      className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm shrink-0"
      style={{ background: "#2d8a4e" }}
    >
      <HeartHandshake className="h-5 w-5" />
    </div>
    <div className="leading-tight">
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

export default AdminBrandMark;
