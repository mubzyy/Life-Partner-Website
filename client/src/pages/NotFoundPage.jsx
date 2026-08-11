import { FileQuestion } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 bg-[#f8fafc]">
        <div className="bg-white border border-slate-100 shadow-sm rounded-[24px] p-8 md:p-12 max-w-[500px] w-full text-center animate-fade-in">
          <div className="w-24 h-24 bg-[#fff0f5] rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion size={40} className="text-[#E91E63]" />
          </div>
          
          <h1 className="text-[32px] font-extrabold text-slate-800 mb-2">404</h1>
          <h2 className="text-xl font-bold text-slate-700 mb-3">Page Not Found</h2>
          
          <p className="text-[14px] text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] rounded-full transition-colors flex-1"
            >
              Go Back
            </button>
            <Link 
              to="/"
              className="px-6 py-3 bg-[#E91E63] hover:bg-pink-600 text-white font-bold text-[14px] rounded-full transition-colors flex-1 shadow-sm"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFoundPage;
