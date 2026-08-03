import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Briefcase,
  Users,
  Coffee,
  Heart,
  Upload
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";

const steps = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Education & Career", icon: Briefcase },
  { id: 3, label: "Family", icon: Users },
  { id: 4, label: "Lifestyle", icon: Coffee },
  { id: 5, label: "Partner Preferences", icon: Heart },
];

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, completeProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/countries`)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(console.error);
  }, []);

  const [form, setForm] = useState({
    // Step 1: Personal
    profilePhotoUrl: "",
    gender: "",
    dob: "",
    maritalStatus: "",
    height: "",
    weight: "",
    religion: "",
    sect: "",
    motherTongue: "",
    nationality: "",
    countryId: user?.country_id || "",
    state: "",
    city: "",
    address: "",
    aboutMe: "",
    
    // Step 2: Education & Career
    occupation: "",
    education: "",
    annualIncome: "",
    
    // Step 3: Family
    fatherOccupation: "",
    motherOccupation: "",
    siblingsCount: "",
    familyType: "",
    familyValues: "",
    
    // Step 4: Lifestyle
    smoking: "",
    drinking: "",
    prayerFrequency: "",
    religiousPreference: "",
    dietaryPreference: "",
    
    // Step 5: Partner Preferences
    partnerAgeRange: "",
    partnerCountries: [],
    partnerMaritalStatus: "",
    partnerEducation: "",
    partnerOccupation: "",
    partnerHeightRange: "",
    partnerAbout: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const togglePartnerCountry = (countryId) => {
    setForm(prev => {
      const exists = prev.partnerCountries.includes(countryId);
      return {
        ...prev,
        partnerCountries: exists 
          ? prev.partnerCountries.filter(id => id !== countryId)
          : [...prev.partnerCountries, countryId]
      };
    });
  };

  const handleNext = async () => {
    if (step < steps.length) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.id,
            profile_photo_url: form.profilePhotoUrl,
            gender: form.gender,
            date_of_birth: form.dob,
            marital_status: form.maritalStatus,
            height: form.height,
            weight: form.weight,
            religion: form.religion,
            sect: form.sect,
            mother_tongue: form.motherTongue,
            nationality: form.nationality,
            state: form.state,
            city: form.city,
            address: form.address,
            about_me: form.aboutMe,
            occupation: form.occupation,
            education: form.education,
            annual_income: form.annualIncome,
            father_occupation: form.fatherOccupation,
            mother_occupation: form.motherOccupation,
            siblings_count: parseInt(form.siblingsCount) || 0,
            family_type: form.familyType,
            family_values: form.familyValues,
            smoking: form.smoking,
            drinking: form.drinking,
            prayer_frequency: form.prayerFrequency,
            religious_preference: form.religiousPreference,
            dietary_preference: form.dietaryPreference,
            partner_age_range: form.partnerAgeRange,
            partner_countries: form.partnerCountries,
            partner_marital_status: form.partnerMaritalStatus,
            partner_education: form.partnerEducation,
            partner_occupation: form.partnerOccupation,
            partner_height_range: form.partnerHeightRange,
            partner_about: form.partnerAbout,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to save profile");
        }
        
        completeProfile({ profileComplete: true });
        navigate("/dashboard");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100";
  const selectClass = `${inputClass} cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center]`;
  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
  const sectionTitleClass = "text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_40%),linear-gradient(180deg,_#ffffff_0%,_#fcfaf7_100%)] flex flex-col overflow-x-hidden">
      <SiteHeader />

      <div className="flex flex-1 items-start justify-center px-4 md:px-8 py-8 md:py-12 w-full">
        <div className="w-full max-w-screen-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Complete your profile
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Tell us about yourself to find the perfect match
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8 flex items-center justify-center gap-1 sm:gap-3 overflow-x-auto pb-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-1 sm:gap-3 shrink-0">
                <div className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      step > s.id
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : step === s.id
                          ? "border-emerald-600 bg-white text-emerald-700 shadow-md scale-110"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight ${step === s.id ? "text-emerald-700" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mb-6 h-px w-6 sm:w-12 transition ${step > s.id ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form card */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            
            {/* Step 1 — Personal */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className={sectionTitleClass}>Personal Information</h2>
                
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 overflow-hidden">
                    {form.profilePhotoUrl ? (
                      <img src={form.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
                    <Upload size={16} />
                    Upload Photo
                    <input type="file" className="hidden" onChange={(e) => {
                       // Simulated photo upload
                       update("profilePhotoUrl", URL.createObjectURL(e.target.files[0]));
                    }} />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={selectClass}>
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select value={form.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Never Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Religion</label>
                    <select value={form.religion} onChange={(e) => update("religion", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Islam</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Sect</label>
                    <select value={form.sect} onChange={(e) => update("sect", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Sunni</option>
                      <option>Shia</option>
                      <option>Just Muslim</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Mother Tongue</label>
                    <input type="text" value={form.motherTongue} onChange={(e) => update("motherTongue", e.target.value)} placeholder="e.g. Urdu, English" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Height</label>
                    <select value={form.height} onChange={(e) => update("height", e.target.value)} className={selectClass}>
                      <option value="">Select Height</option>
                      {["4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""].map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Weight (kg)</label>
                    <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="e.g. 70" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                   <div className="md:col-span-2">
                    <label className={labelClass}>Country of Residence</label>
                    <select value={form.countryId} onChange={(e) => update("countryId", parseInt(e.target.value))} className={selectClass}>
                      <option value="">Select Country</option>
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>{c.flag_emoji} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Nationality</label>
                    <input type="text" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} placeholder="e.g. Pakistani" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>State / Province</label>
                    <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="e.g. Punjab" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Lahore" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Optional" className={inputClass} />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className={labelClass}>About Me</label>
                  <textarea rows={4} value={form.aboutMe} onChange={(e) => update("aboutMe", e.target.value)} placeholder="Write a short, honest introduction about yourself..." className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}

            {/* Step 2 — Education & Career */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className={sectionTitleClass}>Education & Career</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className={labelClass}>Highest Education</label>
                    <select value={form.education} onChange={(e) => update("education", e.target.value)} className={selectClass}>
                      <option value="">Select level</option>
                      <option>High School</option>
                      <option>Associate Degree</option>
                      <option>Bachelor's Degree</option>
                      <option>Master's Degree</option>
                      <option>Doctorate / PhD</option>
                      <option>Islamic Education</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Current Occupation</label>
                    <input type="text" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Annual Income (Optional)</label>
                    <select value={form.annualIncome} onChange={(e) => update("annualIncome", e.target.value)} className={selectClass}>
                      <option value="">Select range</option>
                      <option>Below $20k</option>
                      <option>$20k - $50k</option>
                      <option>$50k - $100k</option>
                      <option>$100k - $200k</option>
                      <option>Above $200k</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Family */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className={sectionTitleClass}>Family Background</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className={labelClass}>Father's Occupation</label>
                    <input type="text" value={form.fatherOccupation} onChange={(e) => update("fatherOccupation", e.target.value)} placeholder="e.g. Retired" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Mother's Occupation</label>
                    <input type="text" value={form.motherOccupation} onChange={(e) => update("motherOccupation", e.target.value)} placeholder="e.g. Housewife" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Number of Siblings</label>
                    <input type="number" min="0" value={form.siblingsCount} onChange={(e) => update("siblingsCount", e.target.value)} placeholder="e.g. 2" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Family Type</label>
                    <select value={form.familyType} onChange={(e) => update("familyType", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Nuclear</option>
                      <option>Joint</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <label className={labelClass}>Family Values</label>
                    <select value={form.familyValues} onChange={(e) => update("familyValues", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Orthodox</option>
                      <option>Traditional</option>
                      <option>Moderate</option>
                      <option>Liberal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Lifestyle */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className={sectionTitleClass}>Lifestyle & Faith</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className={labelClass}>Prayer Frequency</label>
                    <select value={form.prayerFrequency} onChange={(e) => update("prayerFrequency", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Always (5 times a day)</option>
                      <option>Usually</option>
                      <option>Sometimes</option>
                      <option>Rarely</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Appearance Preference</label>
                    <select value={form.religiousPreference} onChange={(e) => update("religiousPreference", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Wear Hijab / Keep Beard</option>
                      <option>Sometimes</option>
                      <option>No Preference</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Dietary Preference</label>
                    <select value={form.dietaryPreference} onChange={(e) => update("dietaryPreference", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Halal Always</option>
                      <option>Mostly Halal</option>
                      <option>Doesn't matter</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Smoking</label>
                    <select value={form.smoking} onChange={(e) => update("smoking", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Occasionally</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Drinking</label>
                    <select value={form.drinking} onChange={(e) => update("drinking", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Occasionally</option>
                      <option>Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Partner Preferences */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className={sectionTitleClass}>Partner Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className={labelClass}>Preferred Age Range</label>
                    <select value={form.partnerAgeRange} onChange={(e) => update("partnerAgeRange", e.target.value)} className={selectClass}>
                      <option value="">Select range</option>
                      <option>18 - 25</option>
                      <option>26 - 30</option>
                      <option>31 - 35</option>
                      <option>36 - 40</option>
                      <option>40+</option>
                      <option>No Preference</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Marital Status</label>
                    <select value={form.partnerMaritalStatus} onChange={(e) => update("partnerMaritalStatus", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Never Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                      <option>Open to all</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Education</label>
                    <select value={form.partnerEducation} onChange={(e) => update("partnerEducation", e.target.value)} className={selectClass}>
                      <option value="">Select level</option>
                      <option>Bachelor's Degree or higher</option>
                      <option>Master's Degree or higher</option>
                      <option>Doesn't matter</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Height Range</label>
                    <select value={form.partnerHeightRange} onChange={(e) => update("partnerHeightRange", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>5'0" - 5'5"</option>
                      <option>5'5" - 5'10"</option>
                      <option>5'10" and above</option>
                      <option>No Preference</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <label className={labelClass}>Preferred Countries</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50">
                      {countries.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => togglePartnerCountry(c.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            form.partnerCountries.includes(c.id)
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {c.flag_emoji} {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 mt-2">
                    <label className={labelClass}>What are you looking for in a partner?</label>
                    <textarea rows={4} value={form.partnerAbout} onChange={(e) => update("partnerAbout", e.target.value)} placeholder="Describe the qualities you value most..." className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className={`flex items-center gap-2 rounded-full px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
                  loading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-700/20"
                }`}
              >
                {loading ? "Saving..." : step === steps.length ? "Complete Profile" : "Continue"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs font-medium text-slate-400">
            Step {step} of {steps.length} — You can always update this later from your profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
