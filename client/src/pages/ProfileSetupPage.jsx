import { useState, useEffect, useRef } from "react";
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
  Upload,
  Loader2
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../lib/authFetch";

const API_URL = import.meta.env.VITE_API_URL;

const steps = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Education & Career", icon: Briefcase },
  { id: 3, label: "Family", icon: Users },
  { id: 4, label: "Lifestyle", icon: Coffee },
  { id: 5, label: "Partner Preferences", icon: Heart },
];

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB — must match server/middleware/upload.js

// Mirrors server/lib/profileFields.js TEXT_LIMITS exactly — the backend is
// still the real authority (it re-validates independently), this just stops
// someone from typing 3000 characters only to have it rejected on save.
const TEXT_LIMITS = {
  motherTongue: 50,
  state: 100,
  city: 100,
  address: 500,
  aboutMe: 2000,
  occupation: 100,
  fatherOccupation: 100,
  motherOccupation: 100,
  partnerAbout: 2000,
};

// Place/language names (mother tongue, state, city) — letters, spaces,
// hyphens, apostrophes and periods only (covers things like "St. Louis" or
// "Cote d'Ivoire") without blocking real names the way a strict letters-only
// filter would.
const filterPlaceName = (v) => v.replace(/[^a-zA-Z\s\-'.]/g, "");

// Bounds for the date-of-birth picker itself — the real 18+ check still
// happens in validateStepClient below; this just stops the native picker
// from ever offering an obviously-impossible date (in the future, or from
// over a century ago) in the first place.
const todayStr = () => new Date().toISOString().slice(0, 10);
const minDobStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  return d.toISOString().slice(0, 10);
};

// ── Per-step payloads (frontend camelCase → backend column names) ──────────
const buildStepPayload = (stepNum, form) => {
  switch (stepNum) {
    case 1:
      return {
        gender: form.gender,
        date_of_birth: form.dob,
        marital_status: form.maritalStatus,
        religion: form.religion,
        sect: form.sect,
        mother_tongue: form.motherTongue,
        height: form.height,
        weight: form.weight,
        country_id: form.countryId || null,
        nationality_id: form.nationalityId || null,
        state: form.state,
        city: form.city,
        address: form.address,
        about_me: form.aboutMe,
      };
    case 2:
      return {
        education: form.education,
        occupation: form.occupation,
        annual_income: form.annualIncome,
      };
    case 3:
      return {
        father_occupation: form.fatherOccupation,
        mother_occupation: form.motherOccupation,
        siblings_count: form.siblingsCount,
        family_type: form.familyType,
        family_values: form.familyValues,
      };
    case 4:
      return {
        prayer_frequency: form.prayerFrequency,
        religious_preference: form.religiousPreference,
        dietary_preference: form.dietaryPreference,
        smoking: form.smoking,
        drinking: form.drinking,
      };
    case 5:
      return {
        partner_age_range: form.partnerAgeRange,
        partner_marital_status: form.partnerMaritalStatus,
        partner_education: form.partnerEducation,
        partner_height_range: form.partnerHeightRange,
        partner_about: form.partnerAbout,
        partner_countries: form.partnerCountries,
      };
    default:
      return {};
  }
};

// ── Client-side "required field" validation, mirrors the backend's rules so
//    users get instant feedback — the backend re-validates independently and
//    is the actual authority (see server/lib/profileValidation.js). ───────
const validateStepClient = (stepNum, form) => {
  const errors = [];
  const req = (val, label) => {
    if (val === undefined || val === null || String(val).trim() === "") {
      errors.push(`${label} is required.`);
    }
  };

  if (stepNum === 1) {
    req(form.gender, "Gender");
    req(form.dob, "Date of birth");
    req(form.maritalStatus, "Marital status");
    req(form.religion, "Religion");
    req(form.sect, "Sect");
    req(form.motherTongue, "Mother tongue");
    req(form.height, "Height");
    req(form.weight, "Weight");
    req(form.countryId, "Country of residence");
    req(form.nationalityId, "Nationality");
    req(form.state, "State / Province");
    req(form.city, "City");

    if (form.dob) {
      const dob = new Date(form.dob);
      if (Number.isNaN(dob.getTime())) {
        errors.push("Date of birth is invalid.");
      } else {
        const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (dob > new Date()) errors.push("Date of birth cannot be in the future.");
        else if (age < 18) errors.push("You must be at least 18 years old.");
      }
    }
    if (form.weight && (Number(form.weight) < 30 || Number(form.weight) > 300 || Number.isNaN(Number(form.weight)))) {
      errors.push("Weight must be a number between 30 and 300 kg.");
    }
  } else if (stepNum === 2) {
    req(form.education, "Highest education");
    req(form.occupation, "Current occupation");
  } else if (stepNum === 3) {
    req(form.fatherOccupation, "Father's occupation");
    req(form.motherOccupation, "Mother's occupation");
    req(form.siblingsCount, "Number of siblings");
    req(form.familyType, "Family type");
    req(form.familyValues, "Family values");
    if (form.siblingsCount !== "" && form.siblingsCount !== null && form.siblingsCount !== undefined) {
      const n = Number(form.siblingsCount);
      if (!Number.isInteger(n) || n < 0) errors.push("Number of siblings must be a whole number of 0 or more.");
    }
  } else if (stepNum === 4) {
    req(form.prayerFrequency, "Prayer frequency");
    req(form.religiousPreference, "Appearance preference");
    req(form.dietaryPreference, "Dietary preference");
    req(form.smoking, "Smoking");
    req(form.drinking, "Drinking");
  } else if (stepNum === 5) {
    req(form.partnerAgeRange, "Preferred age range");
    req(form.partnerMaritalStatus, "Preferred marital status");
    req(form.partnerEducation, "Preferred education");
    req(form.partnerHeightRange, "Preferred height range");
  }

  return errors;
};

const emptyForm = {
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
  nationalityId: "",
  countryId: "",
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
};

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [hydrated, setHydrated] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const submittingRef = useRef(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    fetch(`${API_URL}/api/countries`)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(console.error);

    fetch(`${API_URL}/api/nationalities`)
      .then(res => res.json())
      .then(data => setNationalities(data))
      .catch(console.error);
  }, []);

  // Always pull the freshest profile from the backend when this page opens —
  // never trust stale in-memory state from a previous visit.
  useEffect(() => {
    if (user?.id) refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Hydrate the form from the backend exactly once per visit. Deliberately
  // NOT re-run on every `profile` change (e.g. after a photo upload calls
  // refreshProfile()) — that would clobber whatever the user is mid-typing
  // in other fields with the last-saved server values.
  useEffect(() => {
    if (hydratedRef.current || !profile) return;
    hydratedRef.current = true;

    setForm(prev => ({
      ...prev,
      profilePhotoUrl: profile.profile_photo_url || "",
      gender: profile.gender || "",
      dob: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
      maritalStatus: profile.marital_status || "",
      height: profile.height || "",
      weight: profile.weight || "",
      religion: profile.religion || "",
      sect: profile.sect || "",
      motherTongue: profile.mother_tongue || "",
      nationalityId: profile.nationality_id || "",
      countryId: profile.country_id || user?.country_id || "",
      state: profile.state || "",
      city: profile.city || "",
      address: profile.address || "",
      aboutMe: profile.about_me || "",
      occupation: profile.occupation || "",
      education: profile.education || "",
      annualIncome: profile.annual_income || "",
      fatherOccupation: profile.father_occupation || "",
      motherOccupation: profile.mother_occupation || "",
      siblingsCount: profile.siblings_count !== null && profile.siblings_count !== undefined ? String(profile.siblings_count) : "",
      familyType: profile.family_type || "",
      familyValues: profile.family_values || "",
      smoking: profile.smoking || "",
      drinking: profile.drinking || "",
      prayerFrequency: profile.prayer_frequency || "",
      religiousPreference: profile.religious_preference || "",
      dietaryPreference: profile.dietary_preference || "",
      partnerAgeRange: profile.partner_age_range || "",
      partnerCountries: (profile.partner_countries || []).map(c => c.id),
      partnerMaritalStatus: profile.partner_marital_status || "",
      partnerEducation: profile.partner_education || "",
      partnerOccupation: profile.partner_occupation || "",
      partnerHeightRange: profile.partner_height_range || "",
      partnerAbout: profile.partner_about || "",
    }));

    // Resume where they left off; a user revisiting an already-completed
    // profile lands on step 1 in edit mode instead of being pushed to step 5.
    if (profile.completion && !profile.completion.isComplete) {
      setStep(Math.min(Math.max(profile.completion.currentStep, 1), 5));
    } else {
      setStep(1);
    }

    setHydrated(true);
  }, [profile, user?.country_id]);

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

  // ── Real photo upload: multipart/form-data straight to the backend, which
  //    validates, stores the file on disk, and persists a user_photos row.
  //    No blob: URLs are ever used as the "real" photo. ────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file again later
    if (!file) return;

    setPhotoError("");

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Please upload a JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Photo must be 5MB or smaller.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("primary", "true");

      const res = await authFetch(`${API_URL}/api/profile/me/photos`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to upload photo.");

      update("profilePhotoUrl", result.photo.photo_url);
      await refreshProfile();
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNext = async () => {
    if (submittingRef.current) return;
    setError("");

    const clientErrors = validateStepClient(step, form);
    if (clientErrors.length > 0) {
      setError(clientErrors.join(" "));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    const isLastStep = step === steps.length;

    try {
      const res = await authFetch(`${API_URL}/api/profile/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          data: buildStepPayload(step, form),
          ...(isLastStep ? { complete: true } : {}),
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        const message = (result.errors && result.errors.join(" ")) || result.message || "Failed to save. Please try again.";
        throw new Error(message);
      }

      if (isLastStep) {
        await refreshProfile();
        navigate("/dashboard");
      } else {
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Your data on this step was not lost — please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-border-light bg-background px-4 py-3 text-sm text-text-primary placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors focus:bg-card";
  const selectClass = `${inputClass} cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center]`;
  const labelClass = "mb-1.5 block text-sm font-semibold text-text-primary";
  const sectionTitleClass = "text-xl font-bold text-text-primary mb-6 pb-2 border-b border-slate-100";

  if (!hydrated && (profileLoading || !profile)) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_40%),linear-gradient(180deg,_#ffffff_0%,_#fcfaf7_100%)] flex flex-col">
        <SiteHeader />
        <LoadingState message="Loading your profile…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_40%),linear-gradient(180deg,_#ffffff_0%,_#fcfaf7_100%)] flex flex-col">
      <SiteHeader />

      <div className="flex flex-1 items-start justify-center px-4 md:px-8 py-8 md:py-12 w-full">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-text-primary">
              Complete your profile
            </h1>
            <p className="mt-3 text-base text-text-secondary">
              Tell us about yourself to find the perfect match
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8 w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            <div className="flex items-center md:justify-center gap-2 sm:gap-4 min-w-max">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
                    <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      step > s.id
                        ? "border-primary bg-primary text-white"
                        : step === s.id
                          ? "border-primary bg-card text-primary shadow-md scale-110"
                          : "border-border-light bg-card text-text-muted"
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight ${step === s.id ? "text-primary" : "text-text-muted"}`}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mb-6 h-px w-6 sm:w-12 transition ${step > s.id ? "bg-primary-light" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form card */}
          <div className="rounded-[1.75rem] border border-border-light bg-card p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">

            {/* Step 1 — Personal */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className={sectionTitleClass}>Personal Information</h2>

                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-24 h-24 rounded-full bg-slate-100 border border-border-light flex items-center justify-center mb-3 overflow-hidden">
                    {form.profilePhotoUrl ? (
                      <img src={`${API_URL}${form.profilePhotoUrl}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-text-muted" />
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 size={22} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className={`flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary transition ${uploadingPhoto ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                    <Upload size={16} />
                    {uploadingPhoto ? "Uploading…" : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={handlePhotoChange}
                    />
                  </label>
                  {photoError && <p className="mt-2 text-xs font-semibold text-red-600">{photoError}</p>}
                  <p className="mt-1 text-[11px] text-text-muted">JPEG, PNG or WEBP — up to 5MB</p>
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
                    <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} max={todayStr()} min={minDobStr()} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select value={form.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)} className={selectClass}>
                      <option value="">Select</option>
                      <option>Never Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                      <option>Already Married</option>
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
                    <input type="text" value={form.motherTongue} onChange={(e) => update("motherTongue", filterPlaceName(e.target.value))} placeholder="e.g. Urdu, English" maxLength={TEXT_LIMITS.motherTongue} className={inputClass} />
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
                    <input
                      type="number" min="30" max="300" step="1"
                      value={form.weight}
                      onChange={(e) => update("weight", e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                      placeholder="e.g. 70"
                      className={inputClass}
                    />
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
                    <select value={form.nationalityId} onChange={(e) => update("nationalityId", parseInt(e.target.value))} className={selectClass}>
                      <option value="">Select Nationality</option>
                      {nationalities.map(n => (
                        <option key={n.id} value={n.id}>{n.nationality}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>State / Province</label>
                    <input type="text" value={form.state} onChange={(e) => update("state", filterPlaceName(e.target.value))} placeholder="e.g. Punjab" maxLength={TEXT_LIMITS.state} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input type="text" value={form.city} onChange={(e) => update("city", filterPlaceName(e.target.value))} placeholder="e.g. Lahore" maxLength={TEXT_LIMITS.city} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Optional" maxLength={TEXT_LIMITS.address} className={inputClass} />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelClass}>About Me</label>
                  <textarea rows={4} value={form.aboutMe} onChange={(e) => update("aboutMe", e.target.value)} placeholder="Write a short, honest introduction about yourself..." maxLength={TEXT_LIMITS.aboutMe} className={`${inputClass} resize-none`} />
                  <p className="mt-1 text-[11px] text-text-muted text-right">{form.aboutMe.length}/{TEXT_LIMITS.aboutMe}</p>
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
                    <input type="text" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="e.g. Software Engineer" maxLength={TEXT_LIMITS.occupation} className={inputClass} />
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
                    <input type="text" value={form.fatherOccupation} onChange={(e) => update("fatherOccupation", e.target.value)} placeholder="e.g. Retired" maxLength={TEXT_LIMITS.fatherOccupation} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Mother's Occupation</label>
                    <input type="text" value={form.motherOccupation} onChange={(e) => update("motherOccupation", e.target.value)} placeholder="e.g. Housewife" maxLength={TEXT_LIMITS.motherOccupation} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Number of Siblings</label>
                    <input
                      type="number" min="0" max="30" step="1"
                      value={form.siblingsCount}
                      onChange={(e) => update("siblingsCount", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                      placeholder="e.g. 2"
                      className={inputClass}
                    />
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
                    <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-border-light rounded-xl bg-background">
                      {countries.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => togglePartnerCountry(c.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            form.partnerCountries.includes(c.id)
                              ? "border-primary-light bg-primary-very-light text-primary"
                              : "border-border-light bg-card text-text-secondary hover:border-slate-300"
                          }`}
                        >
                          {c.flag_emoji} {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 mt-2">
                    <label className={labelClass}>What are you looking for in a partner?</label>
                    <textarea rows={4} value={form.partnerAbout} onChange={(e) => update("partnerAbout", e.target.value)} placeholder="Describe the qualities you value most..." maxLength={TEXT_LIMITS.partnerAbout} className={`${inputClass} resize-none`} />
                    <p className="mt-1 text-[11px] text-text-muted text-right">{form.partnerAbout.length}/{TEXT_LIMITS.partnerAbout}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => { setError(""); setStep((s) => s - 1); }}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-text-primary transition hover:border-slate-400 hover:bg-background disabled:opacity-50"
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
                disabled={saving}
                className={`flex items-center gap-2 rounded-full px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
                  saving
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all"
                }`}
              >
                {saving ? "Saving..." : step === steps.length ? "Complete Profile" : "Continue"}
                {!saving && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs font-medium text-text-muted">
            Step {step} of {steps.length} — You can always update this later from your profile
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
