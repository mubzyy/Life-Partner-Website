import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../lib/authFetch";
import { photoUrl } from "../lib/photoUrl";
import {
  User, Shield, Headphones, LogOut, ChevronRight,
  Lock, Bell, Globe, Image as ImageIcon, CreditCard,
  Eye, Clock, MessageSquare, UserX, Key, Smartphone,
  AlertCircle, HelpCircle, FileText, Send, Check, X, Crown, Search
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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

const AccountTab = ({ user, navigate, setActiveTab }) => {
  const { profile } = useAuth();
  const completionPercentage = profile?.completion?.profileCompletion ?? 0;
  const avatarSrc = photoUrl(profile?.profile_photo_url) || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";

  // Real subscription status — from GET /api/subscriptions/me, the same
  // source of truth used by the Dashboard premium widget.
  const [subscription, setSubscription] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const loadSubscription = () => {
    authFetch(`${API_URL}/api/subscriptions/me`)
      .then(res => res.json())
      .then(setSubscription)
      .catch(console.error);
  };

  useEffect(() => { loadSubscription(); }, []);

  const handleCancelSubscription = async () => {
    setCanceling(true);
    setCancelError("");
    try {
      const res = await authFetch(`${API_URL}/api/subscriptions/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel subscription.");
      setShowCancelModal(false);
      loadSubscription();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCanceling(false);
    }
  };

  const billingSubtitle = subscription?.isPremium
    ? `${subscription.plan_name} — active until ${new Date(subscription.ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : "You're on the Free plan — view plans and payment history";

  return (
    <div className="animate-fade-in space-y-8">
      {/* Profile Overview */}
      <div>
        <SectionHeader title="Account Overview" subtitle="Manage your account, preferences and subscription." />
        <div className="bg-white border border-slate-100 rounded-[20px] p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={avatarSrc} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-pink-100" />
            <div>
              <h3 className="text-[16px] font-bold text-slate-800">{user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "User")}</h3>
              <p className="text-[13px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => navigate("/profile/me")} className="py-2.5 px-6 rounded-full font-bold text-[13px] text-white bg-[#E91E63] hover:bg-pink-600 transition-colors shadow-sm shrink-0">
            Edit Profile
          </button>
        </div>

        {/* Completion Progress — real, backend-calculated (same source as Dashboard / Complete Profile) */}
        <div className="mt-4 px-2">
          <div className="flex justify-between text-[12px] font-bold mb-2">
            <span className="text-slate-600">Profile Completion</span>
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
          <ActionRow
            icon={subscription?.isPremium ? Crown : CreditCard}
            title="Subscription & Billing"
            subtitle={billingSubtitle}
            onClick={() => navigate("/packages")}
          />
          {subscription?.isPremium && (
            <>
              {cancelError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-600">{cancelError}</div>
              )}
              <ActionRow
                icon={X}
                title="Cancel Subscription"
                subtitle="End your premium plan immediately"
                destructive
                onClick={() => setShowCancelModal(true)}
              />
            </>
          )}
          <ActionRow icon={Bell} title="Notifications Preferences" subtitle="Manage email and push notifications" onClick={() => setActiveTab("privacy")} />
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => !canceling && setShowCancelModal(false)}
        title="Cancel Subscription"
        text="Are you sure you want to cancel your premium subscription? You'll lose premium features immediately. You can resubscribe anytime."
        confirmText={canceling ? "Canceling…" : "Cancel Subscription"}
        destructive
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
};

const PrivacyTab = ({ navigate, onDeactivated }) => {
  const [settings, setSettings] = useState({
    onlineStatus: true,
    readReceipts: true,
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: "everyone",
    lastSeenVisibility: "matches",
  });
  const [loaded, setLoaded] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  useEffect(() => {
    authFetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings({
          onlineStatus: data.online_status ?? true,
          readReceipts: data.read_receipts ?? true,
          emailNotifications: data.email_notifications ?? true,
          pushNotifications: data.push_notifications ?? true,
          profileVisibility: data.profile_visibility ?? "everyone",
          lastSeenVisibility: data.last_seen_visibility ?? "matches",
        });
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  // Every settings change is persisted immediately — the toggle only reflects the
  // new value once the backend confirms it; a failed save reverts the UI.
  const saveSettings = async (patch, localKey, localValue) => {
    const previous = settings;
    setSettings(prev => ({ ...prev, [localKey]: localValue }));
    try {
      const res = await authFetch(`${API_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to save setting");
    } catch (err) {
      console.error(err);
      setSettings(previous); // revert on failure — never claim a save that didn't happen
    }
  };

  const toggleSetting = (localKey, dbKey) => {
    saveSettings({ [dbKey]: !settings[localKey] }, localKey, !settings[localKey]);
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    setDeactivateError("");
    try {
      const res = await authFetch(`${API_URL}/api/account/deactivate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to deactivate account.");
      setShowDeactivateModal(false);
      onDeactivated();
    } catch (err) {
      setDeactivateError(err.message);
    } finally {
      setDeactivating(false);
    }
  };

  const selectCls = "text-[13px] font-bold text-[#E91E63] bg-transparent border-none outline-none cursor-pointer text-right pr-1";

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <SectionHeader title="Privacy & Security" subtitle="Manage your privacy settings and keep your account secure." />

        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Privacy Settings</h3>
        <div className="space-y-2">
          <ActionRow
            icon={Eye}
            title="Profile Visibility"
            subtitle="Choose who can see your profile"
            action={
              <select
                disabled={!loaded}
                value={settings.profileVisibility}
                onClick={e => e.stopPropagation()}
                onChange={e => saveSettings({ profile_visibility: e.target.value }, "profileVisibility", e.target.value)}
                className={selectCls}
              >
                <option value="everyone">Everyone</option>
                <option value="matches">Matches Only</option>
                <option value="private">Private</option>
              </select>
            }
          />
          <ActionRow
            icon={Clock}
            title="Last Seen"
            subtitle="Choose who can see your last seen"
            action={
              <select
                disabled={!loaded}
                value={settings.lastSeenVisibility}
                onClick={e => e.stopPropagation()}
                onChange={e => saveSettings({ last_seen_visibility: e.target.value }, "lastSeenVisibility", e.target.value)}
                className={selectCls}
              >
                <option value="everyone">Everyone</option>
                <option value="matches">Matches Only</option>
                <option value="nobody">Nobody</option>
              </select>
            }
          />
          <ActionRow
            icon={Globe}
            title="Online Status"
            subtitle="Show when you are online"
            action={<ToggleSwitch checked={settings.onlineStatus} onChange={() => toggleSetting("onlineStatus", "online_status")} />}
          />
          <ActionRow
            icon={Check}
            title="Read Receipts"
            subtitle="Let others know when you read messages"
            action={<ToggleSwitch checked={settings.readReceipts} onChange={() => toggleSetting("readReceipts", "read_receipts")} />}
          />
        </div>
      </div>

      <div>
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Notifications</h3>
        <div className="space-y-2">
          <ActionRow
            icon={Bell}
            title="Email Notifications"
            subtitle="Receive updates about matches and messages by email"
            action={<ToggleSwitch checked={settings.emailNotifications} onChange={() => toggleSetting("emailNotifications", "email_notifications")} />}
          />
          <ActionRow
            icon={Smartphone}
            title="Push Notifications"
            subtitle="Receive push notifications on this device"
            action={<ToggleSwitch checked={settings.pushNotifications} onChange={() => toggleSetting("pushNotifications", "push_notifications")} />}
          />
        </div>
      </div>

      <div>
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Security</h3>
        <div className="space-y-2">
          <ActionRow icon={Key} title="Change Password" subtitle="Update your account password" onClick={() => navigate("/settings/change-password")} />
          <ActionRow icon={Shield} title="Two-Step Verification" subtitle="Add an extra layer of security" action={<span className="text-[12px] font-bold text-slate-400">Not Enabled</span>} />
          <ActionRow icon={UserX} title="Blocked Users" subtitle="Manage users you have blocked" onClick={() => navigate('/blocked-users')} />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        {deactivateError && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-600">{deactivateError}</div>
        )}
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
        onClose={() => !deactivating && setShowDeactivateModal(false)}
        title="Deactivate Account"
        text="Are you sure you want to deactivate your account? Your profile will be hidden from everyone until you log back in. This does not delete your data."
        confirmText={deactivating ? "Deactivating…" : "Deactivate"}
        destructive
        onConfirm={handleDeactivate}
      />
    </div>
  );
};

const TICKET_STATUS_STYLES = {
  open: "bg-blue-50 text-blue-600 border-blue-100",
  in_progress: "bg-amber-50 text-amber-600 border-amber-100",
  resolved: "bg-green-50 text-green-600 border-green-100",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};
const TICKET_STATUS_LABELS = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };

const HelpTab = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqQuery, setFaqQuery] = useState("");
  const [formStatus, setFormStatus] = useState("idle"); // idle, loading, success
  const [formError, setFormError] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // My Requests — real tickets from GET /api/support, so a submitted
  // request's status can actually be tracked instead of vanishing after submit.
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const loadTickets = () => {
    authFetch(`${API_URL}/api/support`)
      .then(res => res.ok ? res.json() : [])
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoadingTickets(false));
  };

  useEffect(() => { loadTickets(); }, []);

  // FAQ stays static informational content (no DB table) — searched
  // client-side over the fixed list below.
  const faqs = [
    { q: "How do I upgrade to Premium?", a: "Go to the Packages page from the main menu and select a plan that suits you." },
    { q: "How can I block someone?", a: "Visit their profile and click the 'Block' button next to Favorite." },
    { q: "Is my personal data secure?", a: "Yes, we use industry-standard encryption to protect your personal data." }
  ];
  const filteredFaqs = faqQuery.trim()
    ? faqs.filter(f => f.q.toLowerCase().includes(faqQuery.toLowerCase()) || f.a.toLowerCase().includes(faqQuery.toLowerCase()))
    : faqs;

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormStatus("loading");
    try {
      const res = await authFetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.errors && data.errors.join(" ")) || data.message || "Failed to send your message.");
      setFormStatus("success");
      setSubject("");
      setMessage("");
      loadTickets();
    } catch (err) {
      setFormError(err.message);
      setFormStatus("idle");
    }
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
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search FAQs..."
            value={faqQuery} onChange={e => setFaqQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
          />
        </div>
        <div className="space-y-3 mb-8">
          {filteredFaqs.length === 0 ? (
            <p className="text-[13px] text-slate-400 px-2 py-4">No FAQs match "{faqQuery}".</p>
          ) : filteredFaqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-slate-200 rounded-[12px] overflow-hidden">
              <button
                className="w-full text-left px-4 py-4 font-bold text-[14px] text-slate-800 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                onClick={() => setActiveFaq(activeFaq === faq.q ? null : faq.q)}
              >
                {faq.q}
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${activeFaq === faq.q ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === faq.q && (
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
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[13px] text-red-600">{formError}</div>
              )}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Subject</label>
                <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]">
                  <option value="">Select a topic...</option>
                  <option value="billing">Billing Issue</option>
                  <option value="technical">Technical Problem</option>
                  <option value="report">Report a User</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">Message</label>
                <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail..." className="w-full p-3 rounded-[12px] bg-slate-50 border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] resize-none" />
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

        {/* My Requests — real tickets from GET /api/support, so status can be tracked */}
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 mt-8">My Requests</h3>
        <div className="space-y-2">
          {loadingTickets ? (
            <p className="text-[13px] text-slate-400 px-2 py-4">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-[13px] text-slate-400 px-2 py-4">You haven't submitted any support requests yet.</p>
          ) : tickets.map(t => (
            <div key={t.id} className="bg-white border border-slate-100 rounded-[14px] p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-slate-800 capitalize truncate">{t.subject.replace("_", " ")}</div>
                <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{t.message}</p>
                <div className="text-[11px] text-slate-400 mt-1">{new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${TICKET_STATUS_STYLES[t.status] || TICKET_STATUS_STYLES.open}`}>
                {TICKET_STATUS_LABELS[t.status] || t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Layout ───────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  const TABS = [
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "help", label: "Help & Support", icon: Headphones },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Deactivation logs the user out immediately — the account still exists
  // (users.is_active = false), but they must be treated as signed out.
  const handleDeactivated = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc]">
      <div className="w-full max-w-[1000px] mx-auto px-4 py-6 md:py-10">
        
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          
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
            {activeTab === "account" && <AccountTab user={user} navigate={navigate} setActiveTab={setActiveTab} />}
            {activeTab === "privacy" && <PrivacyTab navigate={navigate} onDeactivated={handleDeactivated} />}
            {activeTab === "help" && <HelpTab />}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
