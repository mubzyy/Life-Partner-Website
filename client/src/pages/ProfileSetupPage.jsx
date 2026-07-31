import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  BookOpen,
  Heart,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";

const steps = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Background", icon: BookOpen },
  { id: 3, label: "About You", icon: Heart },
];

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { completeProfile } = useAuth();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1
    fullName: "",
    age: "",
    gender: "",
    city: "",
    country: "Pakistan",
    // Step 2
    education: "",
    profession: "",
    sect: "",
    maritalStatus: "",
    height: "",
    // Step 3
    bio: "",
    values: "",
    interests: [],
  });

  const interestOptions = [
    "Reading",
    "Travel",
    "Cooking",
    "Islamic History",
    "Sports",
    "Technology",
    "Art",
    "Nature",
    "Volunteering",
    "Fitness",
    "Music",
    "Photography",
  ];

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
    else {
      completeProfile({ name: form.fullName || "Mubashir Mustafa" });
      navigate("/dashboard");
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_40%),linear-gradient(180deg,_#ffffff_0%,_#fcfaf7_100%)] flex flex-col">
      <SiteHeader />

      <div className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Complete your profile
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Help us find the right match for you
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8 flex items-center justify-center gap-3">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                      step > s.id
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : step === s.id
                          ? "border-emerald-600 bg-white text-emerald-700"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${step === s.id ? "text-emerald-700" : "text-slate-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mb-5 h-px w-12 transition ${step > s.id ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
            {/* Step 1 — Personal */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      min="18"
                      max="60"
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}
                      placeholder="e.g. 26"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="e.g. Lahore"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <select
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className={selectClass}
                    >
                      <option>Pakistan</option>
                      <option>UAE</option>
                      <option>UK</option>
                      <option>USA</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Saudi Arabia</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Background */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Education</label>
                  <select
                    value={form.education}
                    onChange={(e) => update("education", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select level</option>
                    <option>Matric / O-Levels</option>
                    <option>Intermediate / A-Levels</option>
                    <option>Bachelor's Degree</option>
                    <option>Master's Degree</option>
                    <option>PhD / Doctorate</option>
                    <option>Hafiz-e-Quran</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Profession</label>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={(e) => update("profession", e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Sect</label>
                    <select
                      value={form.sect}
                      onChange={(e) => update("sect", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      <option>Sunni</option>
                      <option>Shia</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Marital status</label>
                    <select
                      value={form.maritalStatus}
                      onChange={(e) => update("maritalStatus", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      <option>Never married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Height</label>
                  <select
                    value={form.height}
                    onChange={(e) => update("height", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select height</option>
                    {[
                      "4'8\"",
                      "4'10\"",
                      "5'0\"",
                      "5'1\"",
                      "5'2\"",
                      "5'3\"",
                      "5'4\"",
                      "5'5\"",
                      "5'6\"",
                      "5'7\"",
                      "5'8\"",
                      "5'9\"",
                      "5'10\"",
                      "5'11\"",
                      "6'0\"",
                      "6'1\"",
                      "6'2\"",
                      "6'3\"",
                    ].map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3 — About You */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>About yourself</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    rows={4}
                    placeholder="Write a short, honest introduction about yourself..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Core values</label>
                  <select
                    value={form.values}
                    onChange={(e) => update("values", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select your primary value</option>
                    <option>Family-oriented</option>
                    <option>Faith-centered</option>
                    <option>Career-driven</option>
                    <option>Home-centered</option>
                    <option>Balanced lifestyle</option>
                    <option>Community-focused</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Interests{" "}
                    <span className="font-normal text-slate-400">
                      (select all that apply)
                    </span>
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                          form.interests.includes(interest)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
                className="flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
              >
                {step === 3 ? "Complete Profile" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Step {step} of {steps.length} — You can always update this later
            from your profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
