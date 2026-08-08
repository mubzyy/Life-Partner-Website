import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Users, Headphones, Send, Gem, Star, Crown,
  Check, X, Gift, Eye, Heart, MessageCircle
} from "lucide-react";

// ── Plan Data ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    desc: "Try premium features",
    icon: <Send size={26} className="text-[#E91E63]" />,
    basePrice: 999,
    popular: false,
    features: [
      { text: "See who likes you",              included: true  },
      { text: "Send limited messages (10/day)", included: true  },
      { text: "Profile visibility",             included: true  },
      { text: "Unlimited messages",             included: false },
      { text: "Advanced filters",               included: false },
      { text: "Read receipts",                  included: false },
      { text: "Priority support",               included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    desc: "Perfect for serious matches",
    icon: <Gem size={26} className="text-[#E91E63]" />,
    basePrice: 1999,
    popular: true,
    features: [
      { text: "See who likes you",    included: true },
      { text: "Unlimited messages",   included: true },
      { text: "Advanced search filters", included: true },
      { text: "Read receipts",        included: true },
      { text: "Profile boost (2x views)", included: true },
      { text: "Priority support",     included: true },
    ],
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    desc: "Maximum visibility & connections",
    icon: <Star size={26} className="text-[#E91E63]" />,
    basePrice: 3499,
    popular: false,
    features: [
      { text: "Everything in Premium",    included: true },
      { text: "Profile boost (5x views)", included: true },
      { text: "Highlight your profile",   included: true },
      { text: "Message read priority",    included: true },
      { text: "Exclusive premium badge",  included: true },
      { text: "24/7 priority support",    included: true },
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    desc: "The best experience",
    icon: <Crown size={26} className="text-[#E91E63]" />,
    basePrice: 5999,
    popular: false,
    features: [
      { text: "Everything in Premium Plus",    included: true },
      { text: "Profile boost (10x views)",     included: true },
      { text: "Top of search results",         included: true },
      { text: "Direct message priority",       included: true },
      { text: "Monthly profile spotlight",     included: true },
      { text: "Personal match recommendations", included: true },
    ],
  },
];

const DURATIONS = [
  { id: 1,  label: "1 Month",   months: 1,  discount: 0,  discountLabel: "No discount" },
  { id: 3,  label: "3 Months",  months: 3,  discount: 10, discountLabel: "10% OFF"     },
  { id: 6,  label: "6 Months",  months: 6,  discount: 20, discountLabel: "20% OFF"     },
  { id: 12, label: "12 Months", months: 12, discount: 30, discountLabel: "30% OFF"     },
];

const BENEFITS = [
  { icon: <Eye size={22} className="text-[#E91E63]" />,         title: "More Visibility",          desc: "Your profile will be seen by more potential matches." },
  { icon: <Heart size={22} className="text-[#E91E63]" />,        title: "Better Matches",           desc: "Advanced filters help you find highly compatible matches." },
  { icon: <MessageCircle size={22} className="text-[#E91E63]" />, title: "Meaningful Connections",  desc: "Unlimited chats and priority features help you connect easily." },
];

const HEADER_BADGES = [
  { icon: <Shield size={20} className="text-[#E91E63]" />,    title: "Safe & Secure",     desc: "Your privacy is our priority"   },
  { icon: <Users size={20} className="text-[#E91E63]" />,     title: "Verified Profiles", desc: "Genuine & verified users"       },
  { icon: <Headphones size={20} className="text-[#E91E63]" />, title: "24/7 Support",     desc: "We're here to help"             },
];

// ── Checkout Modal ─────────────────────────────────────────────────────────────
const CheckoutModal = ({ plan, duration, totalPrice, onClose }) => {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-[28px] p-10 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-600" strokeWidth={3} />
          </div>
          <h2 className="text-[22px] font-bold text-slate-800 mb-2">Plan Selected!</h2>
          <p className="text-[14px] text-slate-500 mb-2">
            You've selected the <span className="font-bold text-[#E91E63]">{plan.name}</span> plan for {duration.label}.
          </p>
          <p className="text-[13px] text-slate-400 mb-8">In a live app, payment processing would happen here. Your selection has been saved.</p>
          <button onClick={onClose} className="w-full py-3 bg-[#E91E63] hover:bg-[#d81557] text-white font-bold rounded-[14px] text-[14px] transition-colors border-none cursor-pointer">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[28px] p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-slate-800">Confirm Your Plan</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 border-none cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Plan Details */}
        <div className="bg-[#fff0f5] rounded-[20px] p-5 mb-5 border border-pink-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-pink-100 shadow-sm">
              {plan.icon}
            </div>
            <div>
              <div className="text-[17px] font-bold text-slate-800">{plan.name}</div>
              <div className="text-[13px] text-slate-500">{plan.desc}</div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-pink-100 pt-4">
            <div>
              <div className="text-[13px] text-slate-500 mb-0.5">Billing Period</div>
              <div className="text-[14px] font-bold text-slate-800">{duration.label}</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-slate-500 mb-0.5">Total Amount</div>
              <div className="text-[22px] font-extrabold text-[#E91E63]">PKR {totalPrice.toLocaleString()}</div>
            </div>
          </div>
          {duration.discount > 0 && (
            <div className="mt-3 text-[12px] font-bold text-green-600 bg-green-50 rounded-xl px-3 py-1.5 inline-block">
              You save {duration.discount}% — PKR {Math.round(plan.basePrice * duration.months * duration.discount / 100).toLocaleString()} off
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mb-6">
          <p className="text-[13px] font-bold text-slate-700 mb-3">Included Features:</p>
          <div className="grid grid-cols-1 gap-2">
            {plan.features.filter(f => f.included).map(f => (
              <div key={f.text} className="flex items-center gap-2 text-[13px] text-slate-600">
                <Check size={14} className="text-[#E91E63] shrink-0" strokeWidth={3} />
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mb-5 text-center">By confirming, you agree to our Terms of Service. No real payment will be processed.</p>

        <button
          onClick={() => setConfirmed(true)}
          className="w-full py-3.5 bg-[#E91E63] hover:bg-[#d81557] text-white font-bold rounded-[14px] text-[14px] transition-colors border-none cursor-pointer shadow-md">
          Confirm &amp; Activate Plan
        </button>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const PricingPage = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState("premium");
  const [selectedDurationId, setSelectedDurationId] = useState(1);
  const [activeTab, setActiveTab] = useState("plans");

  const selectedDuration = DURATIONS.find(d => d.id === selectedDurationId);

  const getPrice = (basePrice) => {
    const monthly = basePrice * (1 - selectedDuration.discount / 100);
    return Math.round(monthly);
  };

  const openCheckout = (plan) => {
    navigate("/checkout", {
      state: { planId: plan.id, duration: selectedDuration.months }
    });
  };

  return (
    <>

      <div className="min-h-[calc(100vh-72px)] bg-white px-4 md:px-8 py-8 md:py-12 overflow-x-hidden">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-10">

          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center">
                  <Crown size={20} className="text-[#E91E63]" />
                </div>
                <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-800 m-0 leading-tight">Choose Your Premium Plan</h1>
              </div>
              <p className="text-[15px] text-slate-500 m-0 ml-1">Unlock powerful features and connect with the perfect life partner.</p>
            </div>

            {/* Badge trio */}
            <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
              {HEADER_BADGES.map(b => (
                <div key={b.title} className="flex items-center gap-3 bg-white border border-slate-200 rounded-[16px] px-4 py-3 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-[#fff0f5] flex items-center justify-center shrink-0">{b.icon}</div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{b.title}</div>
                    <div className="text-[11px] text-slate-500">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── TABS ───────────────────────────────────────────────────────── */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-5 py-2.5 rounded-[12px] text-[14px] font-bold border transition-colors cursor-pointer
                ${activeTab === "plans" ? "bg-[#E91E63] text-white border-[#E91E63] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              Premium Plans
            </button>
            <button
              onClick={() => setActiveTab("addons")}
              className={`px-5 py-2.5 rounded-[12px] text-[14px] font-bold border transition-colors cursor-pointer
                ${activeTab === "addons" ? "bg-[#E91E63] text-white border-[#E91E63] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              Add-on Boosts
            </button>
          </div>

          {activeTab === "addons" ? (
            <div className="bg-[#fff0f5] rounded-[24px] p-10 text-center border border-pink-100">
              <Crown size={40} className="text-[#E91E63] mx-auto mb-4" />
              <h2 className="text-[20px] font-bold text-slate-800 mb-2">Add-on Boosts Coming Soon</h2>
              <p className="text-[14px] text-slate-500">Individual profile boosts and feature add-ons will be available soon.</p>
            </div>
          ) : (
            <>
              {/* ── PRICING CARDS ──────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {PLANS.map(plan => {
                  const isSelected = selectedPlanId === plan.id;
                  const price = getPrice(plan.basePrice);
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative flex flex-col rounded-[24px] border-2 transition-all duration-200 cursor-pointer overflow-hidden
                        ${plan.popular
                          ? "border-[#E91E63] shadow-[0_8px_40px_rgba(233,30,99,0.18)]"
                          : isSelected
                          ? "border-[#E91E63] shadow-[0_4px_20px_rgba(233,30,99,0.10)]"
                          : "border-slate-200 hover:border-pink-200 shadow-sm hover:shadow-md"
                        }`}
                    >
                      {/* Most Popular badge */}
                      {plan.popular && (
                        <div className="absolute top-0 left-0 right-0 flex justify-center">
                          <div className="bg-[#E91E63] text-white text-[10px] font-extrabold tracking-widest uppercase px-5 py-1.5 rounded-b-xl shadow-sm">
                            MOST POPULAR
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col flex-1 p-6 ${plan.popular ? "pt-10" : "pt-6"}`}>
                        {/* Plan name & desc */}
                        <div className="text-center mb-5">
                          <h2 className="text-[18px] font-bold text-slate-800 mb-1">{plan.name}</h2>
                          <p className="text-[12px] text-slate-500 m-0">{plan.desc}</p>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                          <div className="w-16 h-16 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center">
                            {plan.icon}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-5">
                          <div className="text-[13px] text-slate-500 font-medium mb-1">PKR</div>
                          <div className="text-[36px] font-extrabold text-slate-800 leading-none mb-1">{price.toLocaleString()}</div>
                          <div className="text-[12px] text-slate-500">/ month</div>
                          {selectedDuration.discount > 0 && (
                            <div className="mt-2 text-[11px] font-bold text-green-600 bg-green-50 rounded-full px-2.5 py-0.5 inline-block">
                              {selectedDuration.discount}% OFF
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 mb-4" />

                        {/* Features */}
                        <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                          {plan.features.map(f => (
                            <li key={f.text} className={`flex items-start gap-2.5 text-[13px] ${f.included ? "text-slate-700" : "text-slate-400"}`}>
                              {f.included
                                ? <Check size={15} className="text-[#E91E63] shrink-0 mt-0.5" strokeWidth={3} />
                                : <X size={15} className="text-slate-300 shrink-0 mt-0.5" strokeWidth={2.5} />
                              }
                              <span className={!f.included ? "line-through" : ""}>{f.text}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan.id); openCheckout(plan); }}
                          className={`w-full py-3 rounded-[14px] text-[14px] font-bold transition-all border-2 cursor-pointer
                            ${plan.popular
                              ? "bg-[#E91E63] border-[#E91E63] text-white hover:bg-[#d81557] shadow-md"
                              : "bg-white border-[#E91E63] text-[#E91E63] hover:bg-[#fff0f5]"
                            }`}>
                          Choose Plan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── BILLING DURATION ───────────────────────────────────────── */}
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-12 h-12 rounded-[14px] bg-[#fff0f5] flex items-center justify-center">
                    <Gift size={22} className="text-[#E91E63]" />
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-slate-800">Save More with Longer Plans</div>
                    <div className="text-[13px] text-slate-500">Get up to 30% OFF on 3, 6, or 12-month plans</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 sm:ml-auto">
                  {DURATIONS.map(d => {
                    const active = selectedDurationId === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDurationId(d.id)}
                        className={`px-5 py-3 rounded-[14px] border-2 text-center min-w-[100px] transition-all cursor-pointer
                          ${active
                            ? "bg-[#E91E63] border-[#E91E63] text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-pink-200 hover:bg-[#fff9fb]"
                          }`}>
                        <div className={`text-[13px] font-bold ${active ? "text-white" : "text-slate-800"}`}>{d.label}</div>
                        <div className={`text-[11px] font-semibold mt-0.5 ${active ? "text-pink-200" : d.discount > 0 ? "text-[#E91E63]" : "text-slate-400"}`}>
                          {d.discountLabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── BENEFITS ───────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {BENEFITS.map(b => (
                  <div key={b.title} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#fff0f5] border border-pink-100 flex items-center justify-center shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-slate-800 mb-1">{b.title}</div>
                      <div className="text-[13px] text-slate-500 leading-relaxed">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── TRUST FOOTER ───────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-4 border-t border-slate-100">
                {[
                  { icon: <Shield size={15} className="text-[#E91E63]" />, text: "100% Secure Payments" },
                  { icon: <Check size={15} className="text-[#E91E63]" strokeWidth={3} />, text: "Cancel Anytime" },
                  { icon: <X size={15} className="text-green-500" />, text: "No Hidden Charges" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PricingPage;
