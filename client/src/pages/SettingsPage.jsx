import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User, Shield, Headphones, LogOut, ChevronRight, 
  Lock, Bell, Globe, Image as ImageIcon, CreditCard,
  Eye, Clock, MessageSquare, UserX, Key, Smartphone,
  AlertCircle, HelpCircle, FileText, Send, Check, X, Crown
} from "lucide-react";

// ── Shared Subcomponents ──────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    {subtitle && <p className="text-[14px] text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

const ActionRow = ({ icon: Icon, title, subtitle, action, onClick, destructive }) => (
  <div 
    className={`flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[14px] hover:border-pink-100 transition-colors ${onClick ? 'cursor-pointer hover:shadow-sm' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${destructive ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-600'}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className={`text-[14px] font-bold ${destructive ? 'text-red-600' : 'text-slate-800'}`}>{title}</div>
        {subtitle && <div className="text-[12px] text-slate-500">{subtitle}</div>}
      </div>
    </div>
    {action || (onClick && <ChevronRight size={18} className="text-slate-400" />)}
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#E91E63]' : 'bg-slate-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ── Modals ────────────────────────────────────────────────────────────────────

const ConfirmModal = ({ isOpen, title, text, confirmText, onConfirm, onClose, destructive }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${destructive ? 'bg-red-100 text-red-500' : 'bg-pink-100 text-[#E91E63]'}`}>
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-[14px] text-slate-500 mb-6">{text}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className={`flex-1 py-2.5 rounded-[12px] font-bold text-white transition-colors ${destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#E91E63] hover:bg-pink-600'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tab Panels ────────────────────────────────────────────────────────────────

const AccountTab = ({ user, navigate }) => {
  const completionPercentage = 80; // Mock completion
  
  return (
    <div className="animate-fade-in space-y-8">
      {/* Profile Overview */}
      <div>
        <SectionHeader title="Account Overview" subtitle="Manage your account, preferences and subscription." />
        <div className="bg-white border border-slate-100 rounded-[20px] p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={user?.photos?.[0] || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-pink-100" />
            <div>
              <h3 className="text-[16px] font-bold text-slate-800">{user?.name || "User"}</h3>
              <p className="text-[13px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => navigate("/profile/me")} className="py-2.5 px-6 rounded-full font-bold text-[13px] text-white bg-[#E91E63] hover:bg-pink-600 transition-colors shadow-sm shrink-0">
            Edit Profile
          </button>
        </div>
        
        {/* Completion Progress */}
        <div className="mt-4 px-2">
          <div className="flex justify-between text-[12px] font-bold mb-2">
            <span className="text-slate-600">Account Completion</span>
            <span className="text-[#E91E63]">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-400 to-[#E91E63] rounded-full" style={{ width: `${completionPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Complete your profile to get more matches</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Quick Actions</h3>
        <div className="space-y-2">
          <ActionRow icon={User} title="Edit Profile" subtitle="Update your personal information" onClick={() => navigate("/profile/me")} />
          <ActionRow icon={ImageIcon} title="Photos" subtitle="Manage your photos and album" onClick={() => navigate("/profile/me")} />
          <ActionRow icon={CreditCard} title="Subscription & Billing" subtitle="View your plan and payment history" onClick={() => navigate("/packages")} />
          <ActionRow icon={Bell} title="Notifications Preferences" subtitle="Manage email and push notifications" onClick={() => {}} />
          <ActionRow icon={Globe} title="Account Settings" subtitle="Language, timezone and other preferences" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

const PrivacyTab = ({ navigate }) => {
  const [toggles, setToggles] = useState({
    onlineStatus: true,
    readReceipts: true,
    twoFactor: false
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    import("../lib/authFetch").then(({ authFetch }) => {
        authFetch(`${import.meta.env.VITE_API_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                setToggles({
                    onlineStatus: data.show_online_status ?? true,
                    readReceipts: data.read_receipts ?? true,
                    twoFactor: data.two_factor ?? false
                });
            })
            .catch(console.error);
    });
  }, []);

  const toggleSetting = (key) => {
      setToggles(prev => {
          const next = { ...prev, [key]: !prev[key] };
          // Save to backend
          import("../lib/authFetch").then(({ authFetch }) => {
              authFetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      show_online_status: next.onlineStatus,
                      read_receipts: next.readReceipts,
                      two_factor: next.twoFactor
                  })
              }).catch(console.error);
          });
          return next;
      });
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <SectionHeader title="Privacy & Security" subtitle="Manage your privacy settings and keep your account secure." />
        
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Privacy Settings</h3>
        <div className="space-y-2">
          <ActionRow icon={Eye} title="Profile Visibility" subtitle="Choose who can see your profile" action={<span className="text-[13px] font-bold text-[#E91E63]">Everyone &gt;</span>} onClick={() => {}} />
          <ActionRow icon={Clock} title="Last Seen" subtitle="Choose who can see your last seen" action={<span className="text-[13px] font-bold text-[#E91E63]">Matches &gt;</span>} onClick={() => {}} />
          <ActionRow 
            icon={Globe} 
            title="Online Status" 
            subtitle="Show when you are online" 
            action={<ToggleSwitch checked={toggles.onlineStatus} onChange={() => toggleSetting('onlineStatus')} />} 
          />
          <ActionRow 
            icon={Check} 
            title="Read Receipts" 
            subtitle="Let others know when you read messages" 
            action={<ToggleSwitch checked={toggles.readReceipts} onChange={() => toggleSetting('readReceipts')} />} 
          />
        </div>
      </div>
      <div>
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Security</h3>
        <div className="space-y-2">
          <ActionRow icon={Key} title="Change Password" subtitle="Update your account password" onClick={() => {}} />
          <ActionRow icon={Shield} title="Two-Step Verification" subtitle="Add an extra layer of security" action={<span className="text-[12px] font-bold text-slate-400">Not Enabled</span>} onClick={() => {}} />
          <ActionRow icon={UserX} title="Blocked Users" subtitle="Manage users you have blocked" onClick={() => navigate('/blocked-users')} />
          <ActionRow icon={Smartphone} title="Sessions & Devices" subtitle="Manage your active sessions" onClick={() => {}} />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <ActionRow 
          icon={AlertCircle} 
          title="Deactivate Account" 
          subtitle="Temporarily disable your profile" 
          destructive 
          onClick={() => setShowDeactivateModal(true)} 
        />
      </div>

      <ConfirmModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Account"
        text="Are you sure you want to deactivate your account? Your profile will be hidden from everyone."
        confirmText="Deactivate"
        destructive
        onConfirm={() => alert("Mock: Account deactivated successfully.")}
      />
    </div>
  );
};

const HelpTab = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formStatus, setFormStatus] = useState("idle"); // idle, loading, success

  const faqs = [
    { q: "How do I upgrade to Premium?", a: "Go to the Packages page from the main menu and select a plan that suits you." },
    { q: "How can I block someone?", a: "Visit their profile, click the three dots in the top right, and select 'Block User'." },
    { q: "Is my personal data secure?", a: "Yes, we use industry-standard encryption to protect your personal data." }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setFormStatus("loading");
    setTimeout(() => setFormStatus("success"), 1500);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <SectionHeader title="Help & Support" subtitle="We're here to help you." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-[16px] border border-pink-100">
            <HelpCircle size={24} className="text-[#E91E63] mb-3" />
            <h3 className="font-bold text-slate-800 text-[15px] mb-1">Help Center</h3>
            <p className="text-[12px] text-slate-600 mb-3">Browse our articles and FAQs</p>
            <button className="text-[13px] font-bold text-[#E91E63] hover:underline">View FAQs →</button>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-[16px] border border-slate-200">
            <MessageSquare size={24} className="text-slate-600 mb-3" />
            <h3 className="font-bold text-slate-800 text-[15px] mb-1">Live Chat</h3>
            <p className="text-[12px] text-slate-600 mb-3">Talk to our support team</p>
            <button className="text-[13px] font-bold text-slate-700 hover:underline">Start Chat →</button>
          </div>
        </div>

        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Frequently Asked Questions</h3>
        <div className="space-y-3 mb-8">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-[12px] overflow-hidden">
              <button 
                className="w-full text-left px-4 py-4 font-bold text-[14px] text-slate-800 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                {faq.q}
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-4 pb-4 text-[13px] text-slate-600 leading-relaxed bg-white">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Contact Support</h3>
        <div className="bg-white border border-slate-200 rounded-[16px] p-5">
          {formStatus === "success" ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800 mb-2">Message Sent!</h3>
              <p className="text-[13px] text-slate-500 mb-6">Our support team will get back to you within 24 hours.</p>
              <button onClick={() => setFormStatus("idle")} className="py-2.5 px-6 rounded-full font-bold text-[13px] text-white bg-slate-800 hover:bg-slate-900 transition-colors">
                Send Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Subject</label>
                <select required className="w-full p-3 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]">
                  <option value="">Select a topic...</option>
                  <option value="billing">Billing Issue</option>
                  <option value="technical">Technical Problem</option>
                  <option value="report">Report a User</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Message</label>
                <textarea required rows={4} placeholder="Describe your issue in detail..." className="w-full p-3 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] resize-none" />
              </div>
              <button 
                type="submit" 
                disabled={formStatus === "loading"}
                className="w-full py-3 rounded-[12px] font-bold text-[14px] text-white bg-[#E91E63] hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formStatus === "loading" ? "Sending..." : (
                  <>Send Message <Send size={16} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Layout ───────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  const TABS = [
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "help", label: "Help & Support", icon: Headphones },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc]">
      <div className="w-full max-w-[1000px] mx-auto px-4 py-6 md:py-10">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-[260px] shrink-0">
            <h1 className="text-[24px] font-extrabold text-slate-800 mb-6 hidden md:block">Settings</h1>
            
            {/* Mobile Tab Scroller */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 hide-scrollbar snap-x">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`snap-start whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === tab.id ? 'bg-[#E91E63] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-col gap-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Settings</div>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-bold transition-all text-left ${activeTab === tab.id ? 'bg-[#E91E63] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              
              <div className="my-2 border-t border-slate-200" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>

          {/* Active Content Area */}
          <div className="w-full flex-1">
            {activeTab === "account" && <AccountTab user={user} navigate={navigate} />}
            {activeTab === "privacy" && <PrivacyTab />}
            {activeTab === "help" && <HelpTab />}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
