import { Heart } from "lucide-react";

const LoadingState = ({ message = "Loading...", fullHeight = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${fullHeight ? 'min-h-[300px] h-full' : ''}`}>
      <div className="relative mb-4">
        <Heart 
          size={40} 
          className="text-[#E91E63] opacity-20" 
          strokeWidth={2} 
        />
        <Heart 
          size={40} 
          className="text-[#E91E63] absolute top-0 left-0 animate-pulse drop-shadow-sm" 
          strokeWidth={2} 
          fill="#E91E63" 
        />
      </div>
      <p className="text-[14px] font-bold text-slate-500 animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
