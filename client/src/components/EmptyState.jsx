import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  onAction,
  compact = false
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center animate-fade-in ${compact ? 'py-8 px-4 h-auto' : 'p-8 md:p-16 h-full min-h-[300px]'}`}>
      <div className={`bg-pink-50 rounded-full flex items-center justify-center mb-6 ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
        {Icon && <Icon size={compact ? 24 : 32} className="text-[#E91E63]" />}
      </div>
      <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-slate-800 mb-2`}>{title}</h3>
      <p className={`text-[14px] text-slate-500 max-w-md mx-auto leading-relaxed ${compact ? 'mb-4' : 'mb-8'}`}>
        {description}
      </p>
      
      {actionLink ? (
        <Link 
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E91E63] hover:bg-pink-600 text-white font-bold text-[14px] rounded-full transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      ) : onAction ? (
        <button 
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E91E63] hover:bg-pink-600 text-white font-bold text-[14px] rounded-full transition-colors shadow-sm"
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
};

export default EmptyState;
