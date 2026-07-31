import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, Heart, ChevronDown, Search } from "lucide-react";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
];

const POOL = [
  "/images/couple1.jpg", "/images/couple2.jpg", "/images/couple3.jpg",
  "/images/couple4.jpg", "/images/couple5.jpg", "/images/couple6.jpg",
  "/images/couple7.jpg", "/images/couple8.jpg"
];

const SLOT_CONFIGS = [
  // Left Side (Indices 0, 1, 2)
  { width: "w-[120px] xl:w-[200px]", margins: "-mr-4 xl:-mr-8 -mb-8 xl:-mb-16", rotation: "-rotate-6", zIndex: "z-0", delay: "0s" },
  { width: "w-[140px] xl:w-[240px]", margins: "mr-2 xl:mr-8", rotation: "rotate-3", zIndex: "z-10", delay: "2s" },
  { width: "w-[110px] xl:w-[180px]", margins: "-mr-2 xl:-mr-4 -mt-8 xl:-mt-14", rotation: "-rotate-3", zIndex: "z-0", delay: "4s" },
  // Right Side (Indices 3, 4, 5)
  { width: "w-[130px] xl:w-[220px]", margins: "-ml-4 xl:-ml-6 -mb-8 xl:-mb-16", rotation: "rotate-6", zIndex: "z-0", delay: "1s" },
  { width: "w-[150px] xl:w-[250px]", margins: "ml-4 xl:ml-10", rotation: "-rotate-3", zIndex: "z-10", delay: "3s" },
  { width: "w-[120px] xl:w-[190px]", margins: "-ml-2 xl:-ml-4 -mt-8 xl:-mt-14", rotation: "rotate-4", zIndex: "z-0", delay: "5s" }
];

const BackgroundShowcase = () => {
  const [displayed, setDisplayed] = useState(POOL.slice(0, 6));
  const [fadeStatus, setFadeStatus] = useState(Array(6).fill('idle')); 

  useEffect(() => {
    POOL.forEach(src => { const img = new Image(); img.src = src; });

    const interval = setInterval(() => {
      const slot = Math.floor(Math.random() * 6);
      
      setDisplayed(currentDisplayed => {
        const available = POOL.filter(img => !currentDisplayed.includes(img));
        const newImg = available[Math.floor(Math.random() * available.length)];
        
        setFadeStatus(prev => {
           const next = [...prev];
           next[slot] = 'out';
           return next;
        });

        setTimeout(() => {
          setDisplayed(prev => {
            const next = [...prev];
            next[slot] = newImg;
            return next;
          });
          setFadeStatus(prev => {
            const next = [...prev];
            next[slot] = 'in';
            return next;
          });
          
          setTimeout(() => {
            setFadeStatus(prev => {
              const next = [...prev];
              next[slot] = 'idle';
              return next;
            });
          }, 1500);

        }, 1500);

        return currentDisplayed; 
      });

    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
      <style>{`
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes subtleRotate {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
      `}</style>
      
      {/* Decorative Background */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[50%] bg-[#0f5d52] rounded-full blur-[140px] opacity-[0.12]"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#d4af37] rounded-full blur-[140px] opacity-[0.08]"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-[#f0f7f5] rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-gradient-to-tr from-[#1a7a6e]/10 to-transparent rounded-full blur-[80px]"></div>
      
      {/* Collage Left */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-[calc(50%-340px)] flex-col justify-center items-end pr-4 xl:pr-10 gap-2 xl:gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className={`relative ${SLOT_CONFIGS[i].margins} ${SLOT_CONFIGS[i].zIndex}`} style={{ animation: `floatAnim 12s ease-in-out infinite ${SLOT_CONFIGS[i].delay}` }}>
            <div className={`${SLOT_CONFIGS[i].rotation}`}>
              <div 
                className={`transition-opacity duration-[1500ms] ease-in-out ${fadeStatus[i] === 'out' ? 'opacity-0' : 'opacity-100'}`}
                style={{ animation: `subtleRotate 14s ease-in-out infinite ${SLOT_CONFIGS[i].delay}` }}
              >
                <img src={displayed[i]} className={`object-cover ${SLOT_CONFIGS[i].width} aspect-[4/5] rounded-[20px] xl:rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] border-[3px] border-white/90`} alt="" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collage Right */}
      <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[calc(50%-340px)] flex-col justify-center items-start pl-4 xl:pl-10 gap-2 xl:gap-4">
        {[3, 4, 5].map(i => (
          <div key={i} className={`relative ${SLOT_CONFIGS[i].margins} ${SLOT_CONFIGS[i].zIndex}`} style={{ animation: `floatAnim 13s ease-in-out infinite ${SLOT_CONFIGS[i].delay}` }}>
            <div className={`${SLOT_CONFIGS[i].rotation}`}>
              <div 
                className={`transition-opacity duration-[1500ms] ease-in-out ${fadeStatus[i] === 'out' ? 'opacity-0' : 'opacity-100'}`}
                style={{ animation: `subtleRotate 15s ease-in-out infinite ${SLOT_CONFIGS[i].delay}` }}
              >
                <img src={displayed[i]} className={`object-cover ${SLOT_CONFIGS[i].width} aspect-[4/5] rounded-[20px] xl:rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] border-[3px] border-white/90`} alt="" />
              </div>
            </div>
          </div>
        ))}
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
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm)
      return setError("Passwords do not match.");

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    if (!firstName || !lastName || !country)
      return setError("Please fill in all required fields.");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          email,
          country,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success — show message then redirect to login
      alert("Account created successfully! Please sign in.");
      navigate("/login");

    } catch {
      setError("Unable to connect to the server. Please try again.");
    }

    setLoading(false);
  };


  const inputClasses = "w-full box-border px-4 py-3.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-[14px] text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-[#0f5d52] focus:bg-white focus:shadow-[0_0_0_2px_rgba(15,93,82,0.1)]";
  const labelClasses = "block text-[13px] font-bold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden z-0" style={{ background: "linear-gradient(135deg, #f0f7f5 0%, #f7f4ee 50%, #eef5f2 100%)" }}>
      
      <BackgroundShowcase />

      {/* Header */}
      <div className="px-6 py-6 md:px-10 lg:px-12 md:py-8">
        <Link to="/" className="inline-flex items-center gap-3.5 no-underline transition-opacity hover:opacity-90">
          <img src={logo} alt="Life Partner" className="h-[56px] w-[56px] object-contain drop-shadow-sm" />
          <div className="flex flex-col justify-center">
            <div style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[26px] leading-none font-bold text-[#0f5d52] tracking-wide mb-1.5">Life Partner</div>
            <div className="text-[12.5px] leading-none font-medium text-[#52706c] tracking-wide">Find your partner for life</div>
          </div>
        </Link>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 relative">
        
        <div className="w-full max-w-[660px]">
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[32px] md:text-[36px] font-bold text-[#1a2e2b] m-0 mb-2">
              Create your account
            </h1>
            <p className="text-[15px] text-[#6b8a86] m-0">Join thousands of verified Muslims looking for a halal life partner.</p>
          </div>

          <div className="bg-white rounded-[24px] border-[1.5px] border-[#e8ebe9] p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all">
            
            {/* Privacy Notice Badge */}
            <div className="flex items-start md:items-center gap-2.5 bg-[#edf7f5] text-[#0f5d52] rounded-lg py-2.5 px-4 mb-8 w-fit mx-auto border border-[#c8e6e0]">
              <span className="text-[14px] leading-tight font-bold shrink-0">✔</span>
              <p className="text-[13px] font-medium m-0 leading-tight">Your information remains private and is never shared without your permission.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Name Row */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                <div className="flex-1">
                  <label className={labelClasses}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First"
                    className={inputClasses}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClasses}>Middle Name <span className="font-normal text-slate-400">(Optional)</span></label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    placeholder="Middle"
                    className={inputClasses}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClasses}>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClasses}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClasses}
                />
              </div>

              {/* Country */}
              <div className="relative" ref={dropdownRef}>
                <label className={labelClasses}>Country *</label>
                <div 
                  className={`${inputClasses} flex items-center justify-between cursor-pointer select-none`}
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <span className={country ? "text-slate-800" : "text-slate-400"}>
                    {country ? (
                      <span className="flex items-center gap-2">
                        <span>{COUNTRIES.find(c => c.name === country)?.flag}</span>
                        {country}
                      </span>
                    ) : "Select your country"}
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                </div>
                
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-slate-50">
                      <Search size={16} className="text-slate-400 ml-1" />
                      <input 
                        type="text" 
                        placeholder="Search countries..." 
                        className="w-full text-[14px] p-1 bg-transparent outline-none text-slate-700"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[220px] overflow-y-auto py-1">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map(c => (
                          <div 
                            key={c.code}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-[14px] text-slate-700 transition-colors"
                            onClick={() => {
                              setCountry(c.name);
                              setShowCountryDropdown(false);
                              setCountrySearch("");
                            }}
                          >
                            <span className="text-[16px]">{c.flag}</span>
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

              {/* Password */}
              <div>
                <label className={labelClasses}>Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`${inputClasses} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-[#0f5d52] transition-colors flex p-1">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClasses}>Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-2 rounded-xl text-white font-bold text-[15px] transition-all duration-300 
                  ${loading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-[#0f5d52] to-[#1a7a6e] hover:from-[#0d4d44] hover:to-[#156359] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_8px_24px_rgba(15,93,82,0.25)] hover:shadow-[0_12px_28px_rgba(15,93,82,0.35)] cursor-pointer'
                  }`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-[12.5px] text-slate-500 mt-6 mb-0">
              By creating an account you agree to our{" "}
              <a href="#" className="text-[#0f5d52] font-bold no-underline hover:underline">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-[#0f5d52] font-bold no-underline hover:underline">Privacy Policy</a>.
            </p>
          </div>

          <p className="text-center text-[14px] text-slate-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0f5d52] font-bold no-underline hover:underline">Sign In</Link>
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 md:gap-12 mt-10 opacity-80">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={22} className="text-[#0f5d52]" />
              <span className="text-[12px] font-medium text-[#1a2e2b]">Verified Profiles</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 size={22} className="text-[#0f5d52]" />
              <span className="text-[12px] font-medium text-[#1a2e2b]">Privacy First</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart size={22} className="text-[#0f5d52]" />
              <span className="text-[12px] font-medium text-[#1a2e2b]">Trusted by Families</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
