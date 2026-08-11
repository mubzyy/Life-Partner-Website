import { AlertTriangle, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "We couldn't load this content. Please try again.", 
  onRetry,
  showHomeButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center animate-fade-in h-full min-h-[300px]">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-[14px] text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E91E63] hover:bg-pink-600 text-white font-bold text-[14px] rounded-full transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
        
        {showHomeButton && (
          <button 
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] rounded-full transition-colors"
          >
            Go Home
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
