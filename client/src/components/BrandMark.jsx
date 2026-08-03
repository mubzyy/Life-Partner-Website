import { HeartHandshake } from "lucide-react";

const BrandMark = ({ compact = false, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
      <HeartHandshake className="h-5 w-5" />
    </div>
    <div className="leading-tight">
      <div className="font-bold text-2xl tracking-wide text-text-primary">
        Life Partner
      </div>
      {!compact && (
        <div className="text-xs font-medium text-slate-500">
          Where trust meets love
        </div>
      )}
    </div>
  </div>
);

export default BrandMark;
