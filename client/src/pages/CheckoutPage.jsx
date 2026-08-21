import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "../lib/authFetch";
import {
  Shield, Lock, RefreshCw, Headphones, CreditCard,
  ChevronDown, ChevronLeft, CheckCircle2, Check, Gem, Crown, Star, Send,
  HelpCircle, AlertCircle, Eye, EyeOff
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Static presentation content only — icon/desc per tier. All prices, plan
// ids and durations come from GET /api/subscriptions/plans (same source of
// truth PricingPage and the backend use). ───────────────────────────────────
const TIER_PRESENTATION = {
  basic:          { name: "Basic Plan",        icon: <Send size={22} className="text-[#E91E63]" />,  desc: "Profile visibility, see who likes you & more" },
  premium:        { name: "Premium Plan",      icon: <Gem size={22} className="text-[#E91E63]" />,   desc: "Unlimited messages, advanced filters, profile boost & more" },
  "premium-plus": { name: "Premium Plus",      icon: <Star size={22} className="text-[#E91E63]" />,  desc: "Everything in Premium plus 5× profile boost & exclusive badge" },
  ultimate:       { name: "Ultimate Plan",     icon: <Crown size={22} className="text-[#E91E63]" />, desc: "Top search results, personal match recommendations & more" },
};

const DURATION_LABELS = { 1: "1 Month", 3: "3 Months", 6: "6 Months", 12: "12 Months" };

// "basic-3mo" → { tier: "basic", months: 3 }
const parsePlanId = (planId) => {
  const match = /^(.+)-(\d+)mo$/.exec(planId || "");
  return match ? { tier: match[1], months: parseInt(match[2], 10) } : { tier: "premium", months: 1 };
};

const PAYMENT_METHODS = [
  { id: "card",     label: "Credit / Debit Card",  logos: ["VISA","MC","JCB","AMEX"] },
  { id: "easypaisa",label: "Easypaisa",             logo: "EP" },
  { id: "jazzcash", label: "JazzCash",              logo: "JC" },
  { id: "bank",     label: "Bank Transfer",         logo: "BT" },
];

const FAQS = [
  { q: "Can I cancel my subscription?",       a: "Yes, you can cancel anytime from your account settings. No questions asked." },
  { q: "Will I be charged automatically?",     a: "Only if you enable auto-renewal. Otherwise, your plan expires and you return to free." },
  { q: "Is my payment information secure?",    a: "Absolutely. We use 256-bit SSL encryption and never store your full card details." },
  { q: "Can I get a refund?",                  a: "We offer a 7-day money-back guarantee if you're not satisfied with your plan." },
];

const SECURITY_ITEMS = [
  { icon: <Shield size={18} className="text-[#E91E63]" />,    title: "100% Secure Payments",    desc: "End-to-end encrypted transactions" },
  { icon: <Eye size={18} className="text-[#E91E63]" />,        title: "No Hidden Charges",       desc: "What you see is what you pay" },
  { icon: <RefreshCw size={18} className="text-[#E91E63]" />,  title: "Cancel Anytime",          desc: "Hassle-free cancellation" },
  { icon: <Headphones size={18} className="text-[#E91E63]" />, title: "24/7 Customer Support",   desc: "We're here to help you" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepBar = ({ step }) => {
  const steps = [
    { n: 1, label: "Plan & Billing",  sub: "Select your plan"       },
    { n: 2, label: "Payment",         sub: "Enter payment details"  },
    { n: 3, label: "Review",          sub: "Review your order"      },
    { n: 4, label: "Complete",        sub: "Subscription activated" },
  ];
  return (
    <div className="flex items-start justify-center gap-2 sm:gap-6 mb-8 overflow-x-auto no-scrollbar pb-2">
      {steps.map((s, i) => {
        const done    = s.n < step;
        const current = s.n === step;
        return (
          <div key={s.n} className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold border-2 transition-colors
                ${done    ? "bg-[#E91E63] border-[#E91E63] text-white"
                : current ? "bg-white border-[#E91E63] text-[#E91E63]"
                           : "bg-white border-slate-200 text-slate-400"}`}>
                {done ? <Check size={16} strokeWidth={3} /> : s.n}
              </div>
              <div className={`text-[11px] sm:text-[13px] font-bold ${current ? "text-[#E91E63]" : done ? "text-slate-600" : "text-slate-400"}`}>{s.label}</div>
              <div className="hidden sm:block text-[10px] text-slate-400">{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 sm:w-16 h-[2px] mt-[-20px] sm:mt-[-18px] rounded-full ${done ? "bg-[#E91E63]" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between py-3.5 text-left bg-transparent border-none cursor-pointer gap-2">
        <span className="text-[13px] font-semibold text-slate-700">{q}</span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-[13px] text-slate-500 leading-relaxed pb-4 m-0">{a}</p>}
    </div>
  );
};

// Card number formatter
const formatCardNumber = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry     = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0,2)} / ${d.slice(2)}` : d;
};

// ─── Success overlay ──────────────────────────────────────────────────────────
// Deliberately does NOT say "Payment Successful" or "charged" — no real
// payment provider is configured (see server/lib/paymentProvider.js), so the
// copy here must not imply real money moved.
const SuccessOverlay = ({ planName, total, testMode, onDone }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[28px] p-10 max-w-sm w-full text-center shadow-2xl">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={40} className="text-green-500" fill="#22c55e" color="white" />
      </div>
      <h2 className="text-[24px] font-extrabold text-slate-800 mb-2">{testMode ? "Subscription Activated (Test Mode)" : "Payment Successful!"}</h2>
      <p className="text-[14px] text-slate-500 mb-1">Welcome to <span className="font-bold text-[#E91E63]">{planName}</span></p>
      <p className="text-[13px] text-slate-400 mb-8">
        {testMode
          ? `No real payment was processed — this app has no payment provider configured yet. PKR ${total.toLocaleString()} was recorded as a test transaction, and your premium features are active.`
          : `PKR ${total.toLocaleString()} charged. Your premium features are now active.`}
      </p>
      <button
        onClick={onDone}
        className="w-full py-3.5 bg-[#E91E63] hover:bg-[#d81557] text-white font-bold rounded-[14px] text-[15px] transition-colors border-none cursor-pointer">
        Go to Dashboard
      </button>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // PricingPage passes a real plan id (e.g. "premium-3mo"); default to the
  // real 1-month Premium plan if none was passed.
  const passedPlanId = location.state?.planId || "premium-1mo";

  const [planId, setPlanId] = useState(passedPlanId);
  const [method, setMethod] = useState("card");
  const [checkoutStep, setCheckoutStep] = useState(1); // 1=plan, 2=payment, 3=review, 4=complete
  const [plans, setPlans] = useState([]); // real rows from GET /api/subscriptions/plans
  const [plansLoading, setPlansLoading] = useState(true);

  // Card form
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors]   = useState({});
  const [payError, setPayError] = useState("");
  const [paying, setPaying]   = useState(false);
  const [successResult, setSuccessResult] = useState(null); // { testMode } once checkout succeeds

  // One idempotency key per checkout attempt — generated on the first Pay
  // click and reused for that same attempt (e.g. a network retry), so an
  // accidental double-submit can't create two subscriptions/transactions.
  // Reset whenever the user picks a different plan (a genuinely new attempt).
  const idempotencyKeyRef = useRef(null);
  useEffect(() => { idempotencyKeyRef.current = null; }, [planId]);

  useEffect(() => {
    fetch(`${API_URL}/api/subscriptions/plans`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPlans(data); })
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  const { tier } = parsePlanId(planId);
  const presentation = TIER_PRESENTATION[tier] || TIER_PRESENTATION.premium;
  const plan = plans.find(p => p.id === planId);
  const oneMonthPlan = plans.find(p => p.id === `${tier}-1mo`);

  // Price math — entirely from the real plan rows, never a local formula.
  const totalPrice   = plan?.price_cents ?? 0;
  const months       = plan?.duration_months ?? 1;
  const monthlyPrice = Math.round(totalPrice / months);
  const regularTotal = (oneMonthPlan?.price_cents ?? totalPrice) * months;
  const savings       = Math.max(0, regularTotal - totalPrice);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    if (method !== "card") return {};
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid 16-digit card number.";
    if (!card.name.trim())                           e.name   = "Cardholder name is required.";
    const [mm] = (card.expiry.replace(" ", "")).split("/");
    if (card.expiry.replace(/\s/g, "").length < 4 || parseInt(mm) > 12) e.expiry = "Enter a valid expiry (MM / YY).";
    if (card.cvv.length < 3)                         e.cvv    = "CVV must be 3 digits.";
    return e;
  };

  // ── Payment handler ──────────────────────────────────────────────────────
  const handlePay = useCallback(async () => {
    setPayError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!plan) { setPayError("This plan is no longer available. Please pick another."); return; }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setPaying(true);
    try {
      const res = await authFetch(`${API_URL}/api/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, payment_method: method, idempotency_key: idempotencyKeyRef.current })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessResult({ testMode: data.testMode });
      } else {
        setPayError(data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setPayError("Unable to reach the server. Please try again.");
    } finally {
      setPaying(false);
    }
  }, [card, method, planId, plan]);

  const inputCls = (field) =>
    `w-full rounded-[12px] border ${errors[field] ? "border-red-400 bg-red-50" : "border-slate-200 bg-[#f9fafb]"} 
     px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#E91E63] focus:bg-white transition-colors`;

  if (!plansLoading && !plan) {
    // The passed/default plan id doesn't exist (or was deactivated) — don't
    // silently show wrong numbers, send the user back to pick a real one.
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] flex items-center justify-center px-4">
        <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-8 max-w-sm text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-[16px] font-bold text-slate-800 mb-2">Plan not found</h2>
          <p className="text-[13px] text-slate-500 mb-5">This plan isn't available anymore.</p>
          <button onClick={() => navigate("/packages")} className="py-2.5 px-6 rounded-full font-bold text-[13px] text-white bg-[#E91E63] hover:bg-pink-600 transition-colors">
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {successResult && (
        <SuccessOverlay planName={presentation.name} total={totalPrice} testMode={successResult.testMode} onDone={() => navigate("/dashboard")} />
      )}

      <div className="min-h-[calc(100vh-72px)] bg-[#f9fafb] px-4 md:px-6 py-6 md:py-8">
        <div className="w-full max-w-[1100px] mx-auto">

          {/* Step Bar */}
          <StepBar step={checkoutStep} />

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-5 min-w-0 w-full">

              {/* Header */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                  <Lock size={18} className="text-[#E91E63]" />
                  <h1 className="text-[22px] font-extrabold text-slate-800 m-0">Checkout</h1>
                </div>
                <p className="text-[13px] text-slate-500 m-0 flex items-center gap-1.5">
                  <Shield size={13} className="text-green-500" /> Test-mode checkout — no real payment provider is connected yet.
                </p>
              </div>

              {/* Selected Plan */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-6">
                <h2 className="text-[14px] font-bold text-slate-800 mb-4">Selected Plan</h2>
                <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#fff9fb] border border-pink-100">
                  <div className="w-14 h-14 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center shrink-0">
                    {presentation.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-extrabold text-slate-800">{presentation.name}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{presentation.desc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[18px] font-extrabold text-[#E91E63]">PKR {monthlyPrice.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400">/ month</div>
                    <button
                      onClick={() => navigate("/packages")}
                      className="text-[12px] font-bold text-[#E91E63] hover:opacity-70 bg-transparent border-none cursor-pointer mt-1 p-0">
                      Change Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Billing Period */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-6">
                <h2 className="text-[14px] font-bold text-slate-800 mb-4">Billing Period</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {plans.filter(p => p.id.startsWith(`${tier}-`)).sort((a, b) => a.duration_months - b.duration_months).map(p => {
                    const active = planId === p.id;
                    const discount = oneMonthPlan
                      ? Math.round((1 - p.price_cents / (oneMonthPlan.price_cents * p.duration_months)) * 100)
                      : 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlanId(p.id)}
                        className={`relative flex flex-col items-center py-4 px-3 rounded-[16px] border-2 transition-all cursor-pointer text-center
                          ${active ? "border-[#E91E63] bg-[#fff0f5] shadow-md" : "border-slate-200 bg-white hover:border-pink-200 hover:bg-[#fff9fb]"}`}>
                        {active && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E91E63] flex items-center justify-center">
                            <Check size={11} strokeWidth={3} className="text-white" />
                          </div>
                        )}
                        <div className={`text-[13px] font-bold mb-1 ${active ? "text-[#E91E63]" : "text-slate-800"}`}>{DURATION_LABELS[p.duration_months] || `${p.duration_months} Months`}</div>
                        <div className="text-[12px] text-slate-600">PKR {p.price_cents.toLocaleString()}</div>
                        {discount > 0 && (
                          <div className="text-[11px] font-extrabold mt-1 text-[#E91E63]">{discount}% OFF</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-6">
                <h2 className="text-[14px] font-bold text-slate-800 mb-4">Payment Method</h2>

                <div className="flex flex-col gap-0 divide-y divide-slate-100 border border-slate-200 rounded-[16px] overflow-hidden">

                  {/* Credit / Debit Card */}
                  <div>
                    <button
                      onClick={() => setMethod("card")}
                      className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-left hover:bg-slate-50 transition-colors gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${method === "card" ? "border-[#E91E63]" : "border-slate-300"}`}>
                          {method === "card" && <div className="w-2.5 h-2.5 rounded-full bg-[#E91E63]" />}
                        </div>
                        <span className="text-[14px] font-semibold text-slate-800">Credit / Debit Card</span>
                      </div>
                      {/* Card logos */}
                      <div className="flex items-center gap-1.5">
                        {["VISA","MC","JCB","AMEX"].map(l => (
                          <div key={l} className="h-6 px-1.5 rounded-[4px] border border-slate-200 bg-white flex items-center text-[8px] font-extrabold text-slate-600">
                            {l === "MC" ? "MC" : l}
                          </div>
                        ))}
                      </div>
                    </button>

                    {/* Card form */}
                    {method === "card" && (
                      <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
                        <div className="pt-4 flex flex-col gap-3">
                          {/* Card Number */}
                          <div>
                            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Card Number</label>
                            <div className="relative">
                              <input
                                type="text" inputMode="numeric" placeholder="1234 1234 1234 1234"
                                value={card.number}
                                onChange={e => setCard(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                                className={inputCls("number")}
                              />
                              <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            {errors.number && <p className="text-[11px] text-red-500 mt-1">{errors.number}</p>}
                          </div>

                          {/* Cardholder + Expiry + CVV */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-1">
                              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Cardholder Name</label>
                              <input
                                type="text" placeholder="Name on card"
                                value={card.name}
                                onChange={e => setCard(p => ({ ...p, name: e.target.value.replace(/[^a-zA-Z\s\-'.]/g, '') }))}
                                maxLength={50}
                                className={inputCls("name")}
                              />
                              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Expiry Date</label>
                              <input
                                type="text" inputMode="numeric" placeholder="MM / YY"
                                value={card.expiry}
                                onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                                className={inputCls("expiry")}
                              />
                              {errors.expiry && <p className="text-[11px] text-red-500 mt-1">{errors.expiry}</p>}
                            </div>
                            <div>
                              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">CVV</label>
                              <div className="relative">
                                <input
                                  type={showCvv ? "text" : "password"} inputMode="numeric" placeholder="123"
                                  maxLength={4}
                                  value={card.cvv}
                                  onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,"").slice(0,4) }))}
                                  className={inputCls("cvv")}
                                />
                                <button
                                  type="button" onClick={() => setShowCvv(p => !p)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0">
                                  {showCvv ? <EyeOff size={16} /> : <HelpCircle size={16} />}
                                </button>
                              </div>
                              {errors.cvv && <p className="text-[11px] text-red-500 mt-1">{errors.cvv}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Easypaisa */}
                  <button
                    onClick={() => setMethod("easypaisa")}
                    className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${method === "easypaisa" ? "border-[#E91E63]" : "border-slate-300"}`}>
                        {method === "easypaisa" && <div className="w-2.5 h-2.5 rounded-full bg-[#E91E63]" />}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-800">Easypaisa</span>
                    </div>
                    <div className="h-7 px-3 rounded-lg bg-[#00a651] text-white text-[11px] font-extrabold flex items-center">easypaisa</div>
                  </button>

                  {/* JazzCash */}
                  <button
                    onClick={() => setMethod("jazzcash")}
                    className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${method === "jazzcash" ? "border-[#E91E63]" : "border-slate-300"}`}>
                        {method === "jazzcash" && <div className="w-2.5 h-2.5 rounded-full bg-[#E91E63]" />}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-800">JazzCash</span>
                    </div>
                    <div className="h-7 px-3 rounded-lg bg-[#cc0033] text-white text-[11px] font-extrabold flex items-center">JazzCash</div>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    onClick={() => setMethod("bank")}
                    className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${method === "bank" ? "border-[#E91E63]" : "border-slate-300"}`}>
                        {method === "bank" && <div className="w-2.5 h-2.5 rounded-full bg-[#E91E63]" />}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-800">Bank Transfer</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                </div>

                {/* SSL notice */}
                <div className="flex items-center gap-2 mt-4 text-[12px] text-slate-500">
                  <Shield size={14} className="text-[#E91E63] shrink-0" />
                  We use 256-bit SSL encryption to keep your payment information safe and secure.
                </div>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 text-sm text-red-600">
                  {payError}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-[22px] border border-slate-200 shadow-sm px-6 py-5">
                <button
                  onClick={() => navigate("/packages")}
                  className="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-[#E91E63] bg-transparent border-none cursor-pointer transition-colors">
                  <ChevronLeft size={16} /> Back to Plans
                </button>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
                  <button
                    onClick={handlePay}
                    disabled={paying || plansLoading || !plan}
                    className="flex items-center gap-2 bg-[#E91E63] hover:bg-[#d81557] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-[14px] px-8 py-3.5 text-[15px] transition-colors border-none cursor-pointer shadow-lg min-w-[220px] justify-center">
                    {paying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Pay PKR {totalPrice.toLocaleString()}
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2 text-center sm:text-left">You can cancel anytime</p>
                </div>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-2">
                {[
                  { icon: <Shield size={14} className="text-[#E91E63]" />,    label: "100% Secure Payments" },
                  { icon: <RefreshCw size={14} className="text-[#E91E63]" />, label: "Cancel Anytime" },
                  { icon: <Lock size={14} className="text-[#E91E63]" />,      label: "No Hidden Charges" },
                ].map(i => (
                  <div key={i.label} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                    {i.icon} {i.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
            <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 flex flex-col gap-5">

              {/* Order Summary */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-6">
                <h2 className="text-[16px] font-extrabold text-slate-800 mb-5">Order Summary</h2>

                <div className="flex items-center justify-between text-[13px] text-slate-600 mb-3">
                  <span>{presentation.name} ({DURATION_LABELS[months] || `${months} Months`})</span>
                  <span className="font-bold text-slate-800">PKR {regularTotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-[13px] text-slate-600 mb-3 pb-3 border-b border-slate-100">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">PKR {regularTotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-[13px] mb-4 pb-4 border-b border-slate-100">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-bold text-[#E91E63]">
                    {savings > 0 ? `- PKR ${savings.toLocaleString()}` : "- PKR 0"}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-[15px] font-extrabold text-slate-800">Total</span>
                  <span className="text-[22px] font-extrabold text-[#E91E63]">PKR {totalPrice.toLocaleString()}</span>
                </div>

                <div className={`flex items-center gap-2 rounded-[12px] px-4 py-3 ${savings > 0 ? "bg-green-50 border border-green-100" : "bg-slate-50 border border-slate-100"}`}>
                  <CheckCircle2 size={16} className={savings > 0 ? "text-green-500" : "text-slate-400"} fill={savings > 0 ? "#22c55e" : "none"} color={savings > 0 ? "white" : "currentColor"} />
                  <span className={`text-[12px] font-semibold ${savings > 0 ? "text-green-700" : "text-slate-500"}`}>
                    {savings > 0
                      ? `You're saving PKR ${savings.toLocaleString()} with this plan`
                      : "Select a longer plan to save more"}
                  </span>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-6">
                <h2 className="text-[15px] font-bold text-slate-800 mb-4">Your Security is Our Priority</h2>
                <div className="flex flex-col gap-4">
                  {SECURITY_ITEMS.map(s => (
                    <div key={s.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center shrink-0">{s.icon}</div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">{s.title}</div>
                        <div className="text-[11px] text-slate-500">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-[22px] border border-slate-200 shadow-sm p-6">
                <h2 className="text-[15px] font-bold text-slate-800 mb-2">Frequently Asked Questions</h2>
                {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
