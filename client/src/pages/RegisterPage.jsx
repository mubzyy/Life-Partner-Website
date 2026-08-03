import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, Heart, ChevronDown, Search, Mail, Lock, User, UserPlus, MapPin } from "lucide-react";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";



const POOL = [
  "/images/couple1.jpg", "/images/couple2.jpg", "/images/couple3.jpg",
  "/images/couple4.jpg", "/images/couple5.jpg", "/images/couple6.jpg",
  "/images/couple7.jpg", "/images/couple8.jpg"
];

const BackgroundShowcase = () => {
  const [displayed, setDisplayed] = useState(POOL.slice(0, 6)); // 3 left, 3 right = 6 images
  const [fadeStatus, setFadeStatus] = useState([false, false, false, false, false, false]);

  useEffect(() => {
    // Preload all images
    POOL.forEach(src => { const img = new Image(); img.src = src; });

    const interval = setInterval(() => {
      const slot = Math.floor(Math.random() * 6);
      
      setFadeStatus(prev => {
        const next = [...prev];
        next[slot] = true;
        return next;
      });

      setTimeout(() => {
        setDisplayed(prev => {
          const available = POOL.filter(img => !prev.includes(img));
          if (available.length === 0) return prev;
          const newImg = available[Math.floor(Math.random() * available.length)];
          const next = [...prev];
          next[slot] = newImg;
          return next;
        });
        
        setFadeStatus(prev => {
          const next = [...prev];
          next[slot] = false;
          return next;
        });
      }, 500); // Super fast 500ms fade out
    }, 1800); // Change one image rapidly every 1.8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#faf9f6]">
      <style>{`
        @keyframes floatFast1 {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-16px) rotate(45deg); }
        }
        @keyframes floatFast2 {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-24px) rotate(45deg); }
        }
        @keyframes floatFast3 {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-10px) rotate(45deg); }
        }
      `}</style>
      
      {/* Left Diamond Grid (3 items, inconsistent sizes) */}
      <div className="hidden xl:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-10 opacity-95">
        
        {/* Top: Medium, offset left */}
        <div className="animate-[floatFast1_8s_ease-in-out_infinite] ml-0">
          <div className={`w-[180px] h-[180px] rounded-[24px] overflow-hidden border-[6px] border-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-700 ease-in-out ${fadeStatus[0] ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <img src={displayed[0]} className="w-[150%] h-[150%] max-w-none object-cover transform -rotate-45 -translate-x-[17%] -translate-y-[17%]" alt="" />
          </div>
        </div>

        {/* Middle: Large, offset right */}
        <div className="animate-[floatFast2_11s_ease-in-out_infinite] ml-32">
          <div className={`w-[250px] h-[250px] rounded-[32px] overflow-hidden border-[6px] border-white shadow-[0_25px_50px_rgba(0,0,0,0.15)] transition-all duration-700 ease-in-out ${fadeStatus[1] ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <img src={displayed[1]} className="w-[150%] h-[150%] max-w-none object-cover transform -rotate-45 -translate-x-[17%] -translate-y-[17%]" alt="" />
          </div>
        </div>

        {/* Bottom: Small, offset left */}
        <div className="animate-[floatFast3_9s_ease-in-out_infinite] -ml-8">
          <div className={`w-[140px] h-[140px] rounded-[20px] overflow-hidden border-[5px] border-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-700 ease-in-out ${fadeStatus[2] ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <img src={displayed[2]} className="w-[150%] h-[150%] max-w-none object-cover transform -rotate-45 -translate-x-[17%] -translate-y-[17%]" alt="" />
          </div>
        </div>

      </div>

      {/* Right Diamond Grid (3 items, mirrored sizes) */}
      <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-10 opacity-95">
        
        {/* Top: Small, offset right */}
        <div className="animate-[floatFast3_10s_ease-in-out_infinite] -mr-8">
          <div className={`w-[140px] h-[140px] rounded-[20px] overflow-hidden border-[5px] border-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-700 ease-in-out ${fadeStatus[3] ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <img src={displayed[3]} className="w-[150%] h-[150%] max-w-none object-cover transform -rotate-45 -translate-x-[17%] -translate-y-[17%]" alt="" />
          </div>
        </div>

        {/* Middle: Large, offset left */}
        <div className="animate-[floatFast2_12s_ease-in-out_infinite] mr-32">
          <div className={`w-[250px] h-[250px] rounded-[32px] overflow-hidden border-[6px] border-white shadow-[0_25px_50px_rgba(0,0,0,0.15)] transition-all duration-700 ease-in-out ${fadeStatus[4] ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <img src={displayed[4]} className="w-[150%] h-[150%] max-w-none object-cover transform -rotate-45 -translate-x-[17%] -translate-y-[17%]" alt="" />
          </div>
        </div>

        {/* Bottom: Medium, offset right */}
        <div className="animate-[floatFast1_9s_ease-in-out_infinite] mr-0">
          <div className={`w-[180px] h-[180px] rounded-[24px] overflow-hidden border-[6px] border-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all duration-700 ease-in-out ${fadeStatus[5] ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <img src={displayed[5]} className="w-[150%] h-[150%] max-w-none object-cover transform -rotate-45 -translate-x-[17%] -translate-y-[17%]" alt="" />
          </div>
        </div>

      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropdownRef = useRef(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/countries`)
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        if (!selectedCountry) {
          const pk = data.find(c => c.name === "Pakistan");
          if (pk) {
            setSelectedCountry(pk);
            setPhoneCode(pk.phone_code);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm)
      return setError("Passwords do not match.");

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    if (!termsAccepted)
      return setError("You must agree to the Terms of Service and Privacy Policy.");

    if (!firstName.trim() || !lastName.trim() || !selectedCountry || !phoneNumber)
      return setError("Please fill in all required fields.");

    if (firstName.trim().length < 2)
      return setError("First name must be at least 2 characters.");

    if (lastName.trim().length < 2)
      return setError("Last name must be at least 2 characters.");

    if (phoneNumber.length < 7)
      return setError("Please enter a valid phone number (minimum 7 digits).");

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          email,
          country_id: selectedCountry.id,
          phone_code: phoneCode,
          phone_number: phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ? `${data.message} (${data.error})` : data.message || "Failed to send verification email.");
        setLoading(false);
        return;
      }

      // Show OTP modal
      setOtpValue("");
      setOtpError("");
      setShowOtpModal(true);
      startResendCooldown();

    } catch {
      setError("Unable to connect to the server. Please try again.");
    }

    setLoading(false);
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName, middle_name: middleName, last_name: lastName,
          email, country_id: selectedCountry.id,
          phone_code: phoneCode, phone_number: phoneNumber, password,
        }),
      });
      startResendCooldown();
    } catch {
      setOtpError("Failed to resend code. Please try again.");
    }
    setResendLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return setOtpError("Please enter the full 6-digit code.");
    setOtpLoading(true);
    setOtpError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-and-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await response.json();
      if (!response.ok) {
        setOtpError(data.message || "Verification failed.");
        setOtpLoading(false);
        return;
      }
      setShowOtpModal(false);
      setShowSuccessModal(true);
    } catch {
      setOtpError("Connection error. Please try again.");
    }
    setOtpLoading(false);
  };


  const inputClasses = "w-full box-border pl-10 pr-4 py-2.5 sm:py-3 rounded-[14px] border-[1.5px] border-slate-200 bg-white text-[14px] text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand focus:shadow-[0_0_0_3px_rgba(15,93,82,0.1)]";
  const labelClasses = "block text-[13px] font-bold text-slate-700 mb-1.5";
  const iconClasses = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]";

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden z-0 bg-[#faf9f6]">
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-[22px] font-bold text-slate-800 mb-2">Account Created</h3>
            <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
              Your account has been created successfully. Welcome to Life Partner!
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] transition-all bg-brand hover:bg-[#0d4d44] shadow-[0_8px_24px_rgba(15,93,82,0.25)]"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0f5d52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>

            <h3 className="text-[22px] font-bold text-[#1a2e2b] mb-2">Check your email</h3>
            <p className="text-[14px] text-slate-500 mb-1 leading-relaxed">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-[14px] font-bold text-brand mb-6">{email}</p>

            {otpError && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-[13px] text-red-600 text-left">
                {otpError}
              </div>
            )}

            {/* OTP Input */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpValue}
              onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full text-center text-[28px] font-bold tracking-[12px] py-4 px-4 rounded-xl border-[2px] border-slate-200 bg-slate-50 text-[#1a2e2b] outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,93,82,0.1)] mb-5"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otpValue.length !== 6}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] transition-all mb-4 ${
                otpLoading || otpValue.length !== 6
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-brand hover:bg-[#0d4d44] shadow-[0_6px_20px_rgba(15,93,82,0.25)] cursor-pointer'
              }`}
            >
              {otpLoading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <div className="flex items-center gap-1 text-[13px] text-slate-500">
              <span>Didn't receive it?</span>
              {resendCooldown > 0 ? (
                <span className="text-slate-400 font-medium">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-brand font-bold hover:underline cursor-pointer bg-transparent border-none"
                >
                  {resendLoading ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="mt-4 text-[12px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none"
            >
              ← Go back and edit details
            </button>
          </div>
        </div>
      )}

      <BackgroundShowcase />

      {/* Header (Absolute top left) */}
      <div className="absolute top-0 left-0 px-6 py-6 z-20">
        <Link to="/" className="inline-flex items-center gap-3.5 no-underline transition-opacity hover:opacity-90">
          <img src={logo} alt="Life Partner" className="h-[48px] w-[48px] object-contain drop-shadow-sm" />
          <div className="flex flex-col justify-center">
            <div className="font-serif text-[22px] md:text-[26px] leading-none font-bold text-[#0f5d52] tracking-wide mb-1.5">Life Partner</div>
            <div className="text-[11px] md:text-[12.5px] leading-none font-medium text-[#52706c] tracking-wide">Find your partner for life</div>
          </div>
        </Link>
      </div>

      {/* Form Container */}
      <div className="flex flex-col items-center justify-center px-4 py-8 lg:py-12 z-10 relative w-full">
        
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
            
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-[#d4af37]"></div>
                <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-[#1a2e2b] m-0">
                  Create your account
                </h1>
                <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-[#d4af37]"></div>
              </div>
              <p className="text-[15px] text-[#6b8a86] m-0">Join thousands of verified Muslims looking for a halal life partner.</p>
            </div>

            {/* Privacy Notice Badge */}
            <div className="flex items-center gap-2.5 bg-brand-light text-brand rounded-xl py-3 px-4 mb-6 w-fit mx-auto border border-[#c8e6e0]">
              <ShieldCheck size={18} className="shrink-0" />
              <p className="text-[13px] font-medium m-0 leading-tight">Your information remains private and is never shared without your permission.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-[13px] text-red-600 flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClasses}>First Name *</label>
                  <div className="relative">
                    <User className={iconClasses} />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))}
                      placeholder="First"
                      maxLength={50}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Middle Name <span className="font-normal text-slate-400">(Opt)</span></label>
                  <div className="relative">
                    <User className={iconClasses} />
                    <input
                      type="text"
                      value={middleName}
                      onChange={e => setMiddleName(e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))}
                      placeholder="Middle"
                      maxLength={50}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Last Name *</label>
                  <div className="relative">
                    <User className={iconClasses} />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value.replace(/[^a-zA-Z\s\-']/g, ''))}
                      placeholder="Last"
                      maxLength={50}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClasses}>Email Address *</label>
                <div className="relative">
                  <Mail className={iconClasses} />
                  <input type="email" required value={email} name="email" onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClasses} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Country */}
                <div className="relative" ref={dropdownRef}>
                  <label className={labelClasses}>Country *</label>
                  <div 
                    className={`w-full box-border pl-10 pr-4 py-2.5 sm:py-3 rounded-[14px] border-[1.5px] border-slate-200 bg-white text-[14px] flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:border-slate-300 ${showCountryDropdown ? 'border-brand shadow-[0_0_0_3px_rgba(15,93,82,0.1)]' : ''}`}
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
                    <span className={selectedCountry ? "text-slate-800" : "text-slate-400"}>
                      {selectedCountry ? selectedCountry.name : "Select country"}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                  </div>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                      <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-slate-50">
                        <Search size={16} className="text-slate-400 ml-1" />
                        <input type="text" placeholder="Search countries..." className="w-full text-[14px] p-1 bg-transparent outline-none text-slate-700" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto py-1">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map(c => (
                            <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-[14px] text-slate-700 transition-colors" onClick={() => { setSelectedCountry(c); setPhoneCode(c.phone_code); setShowCountryDropdown(false); setCountrySearch(""); }}>
                              {c.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-500 text-[13px]">No countries found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className={labelClasses}>Phone Number *</label>
                  <div className="flex gap-2">
                    <div className="relative w-[110px]">
                      <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className={`w-full box-border px-3 py-2.5 sm:py-3 rounded-[14px] border-[1.5px] border-slate-200 bg-white text-[14px] text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand focus:shadow-[0_0_0_3px_rgba(15,93,82,0.1)] cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]`}>
                        {countries.map(c => (
                          <option key={c.id} value={c.phone_code}>{c.iso_code} {c.phone_code}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="300 1234567"
                      maxLength={15}
                      className={`flex-1 min-w-0 box-border px-4 py-2.5 sm:py-3 rounded-[14px] border-[1.5px] border-slate-200 bg-white text-[14px] text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand focus:shadow-[0_0_0_3px_rgba(15,93,82,0.1)]`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className={labelClasses}>Password *</label>
                  <div className="relative">
                    <Lock className={iconClasses} />
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" className={`${inputClasses} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors p-1">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClasses}>Confirm Password *</label>
                  <div className="relative">
                    <Lock className={iconClasses} />
                    <input type={showPassword ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password" className={`${inputClasses} pr-10`} />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer accent-brand"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="text-[13px] text-slate-600 cursor-pointer select-none">
                  I agree to the <a href="#" className="text-brand font-bold no-underline hover:underline">Terms of Service</a> and <a href="#" className="text-brand font-bold no-underline hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-4 mt-2 rounded-[14px] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand hover:bg-[#0d4d44] hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(15,93,82,0.25)] hover:shadow-[0_12px_28px_rgba(15,93,82,0.35)] cursor-pointer'}`}>
                {loading ? "Creating account..." : (
                  <>
                    <UserPlus size={20} />
                    Create Account
                  </>
                )}
              </button>
            </form>
            
            {/* Social Logins */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative bg-white px-4 text-[13px] text-slate-400 font-medium">or sign up with</div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-[14px] font-bold text-slate-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="hidden sm:inline">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-[14px] font-bold text-slate-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-[14px] font-bold text-slate-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09.13.189.273.385.432.573 1.03 1.488 2.235 3.125 3.864 3.155 1.514.027 2.05-.905 3.873-.905 1.82 0 2.31.905 3.899.878 1.688-.027 2.73-1.488 3.755-2.98.54-.789 1.053-1.636 1.515-2.525-1.748-.684-2.883-2.404-2.835-4.321.053-2.32 1.859-3.666 1.93-3.712-1.085-1.584-2.766-1.815-3.376-1.867-2.062-.218-4.048 1.104-4.872 1.104-1.296 0-3.08-1.096-4.834-1.077h.051zm.55-1.579c.961-.131 2.203-.787 2.825-1.777-.552-.907-1.442-1.528-2.434-1.691-.976-.145-2.228.718-2.87 1.704.57.94 1.526 1.597 2.479 1.764z"/>
                  </svg>
                  <span className="hidden sm:inline">Apple</span>
                </button>
              </div>
            </div>

          </div>

          <p className="text-center text-[14px] sm:text-[15px] text-slate-500 mt-8 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-brand font-bold no-underline hover:underline">Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
