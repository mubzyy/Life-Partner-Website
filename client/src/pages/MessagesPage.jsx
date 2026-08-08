import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageCircle, Edit, Search, Filter, Archive,
  Phone, Video, MoreVertical, Paperclip, Smile, Send,
  User, Heart, Star, MoreHorizontal, GraduationCap, MapPin, CheckCircle2,
  ChevronLeft, ChevronRight, Book, Coffee, X, Inbox, BellOff, Trash2, Flag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── Emoji Picker (simple) ─────────────────────────────────────────────────────
const EMOJIS = ["😊","😄","😂","🥰","😍","🙏","👍","❤️","✨","🌹","😇","🤗","💕","🌺","😘","💖","🎉","🌙","⭐","😌","🙌","💐","🥹","😢","😭","🤲","💪","👏","🌸","🦋"];
const EmojiPicker = ({ onSelect, onClose }) => (
  <div className="absolute bottom-16 right-0 bg-white border border-slate-200 rounded-[16px] shadow-xl p-3 z-50 w-[260px]">
    <div className="flex items-center justify-between mb-2 px-1">
      <span className="text-[12px] font-bold text-slate-600">Quick Emojis</span>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"><X size={14} /></button>
    </div>
    <div className="grid grid-cols-6 gap-1">
      {EMOJIS.map(e => (
        <button key={e} onClick={() => onSelect(e)} className="w-9 h-9 text-xl flex items-center justify-center hover:bg-slate-50 rounded-xl cursor-pointer bg-transparent border-none">
          {e}
        </button>
      ))}
    </div>
  </div>
);

// ── Per-user chat data ────────────────────────────────────────────────────────
const INITIAL_CHAT_DATA = {
  1: {
    messages: [
      { id: 1, sender: "them", text: "Assalamualaikum Tanzeel! 😊", time: "10:30 AM", status: "read" },
      { id: 2, sender: "them", text: "I went through your profile and really liked it.", time: "10:31 AM", status: "read" },
      { id: 3, sender: "me", text: "Walaikumassalam Ayesha! 😊", time: "10:31 AM", status: "read" },
      { id: 4, sender: "them", text: "We have a lot in common, especially our love for traveling and books.", time: "10:32 AM", status: "read" },
      { id: 5, sender: "me", text: "That's awesome to hear! Which books are you reading these days?", time: "10:33 AM", status: "read" },
      { id: 6, sender: "them", text: 'I\'m currently reading "The Alchemist". Have you read it?', time: "10:34 AM", status: "read" },
      { id: 7, sender: "me", text: "Yes! One of my favorite books. Paulo Coelho writes magic. ✨", time: "10:35 AM", status: "read" },
      { id: 8, sender: "them", text: "Totally agree! 😊", time: "10:36 AM", status: "read" },
      { id: 9, sender: "them", text: "That sounds great! 😄", time: "10:37 AM", status: "read" },
    ],
    typing: true,
  },
  2: {
    messages: [
      { id: 1, sender: "them", text: "Assalamualaikum! 🌹", time: "9:00 AM", status: "read" },
      { id: 2, sender: "me", text: "Walaikumassalam Fatima! How are you?", time: "9:05 AM", status: "read" },
      { id: 3, sender: "them", text: "I'm doing well, Alhamdulillah. I sent you my preferences.", time: "9:10 AM", status: "read" },
      { id: 4, sender: "me", text: "Sure, I'll go through them!", time: "9:15 AM", status: "read" },
    ],
    typing: false,
  },
  3: {
    messages: [
      { id: 1, sender: "me", text: "Assalamualaikum Zainab!", time: "8:00 AM", status: "read" },
      { id: 2, sender: "them", text: "Walaikumassalam! JazakAllah! 😊", time: "8:05 AM", status: "read" },
    ],
    typing: false,
  },
  4: {
    messages: [
      { id: 1, sender: "them", text: "Assalamualaikum, I've been looking at your profile.", time: "Yesterday", status: "read" },
      { id: 2, sender: "me", text: "JazakAllah for reaching out!", time: "Yesterday", status: "read" },
      { id: 3, sender: "them", text: "Looking forward to it!", time: "Yesterday", status: "read" },
    ],
    typing: false,
  },
  5: {
    messages: [
      { id: 1, sender: "me", text: "Assalamualaikum Sarah!", time: "3h ago", status: "read" },
      { id: 2, sender: "them", text: "Walaikumassalam! Thanks a lot! 👍", time: "3h ago", status: "read" },
    ],
    typing: false,
  },
  6: {
    messages: [
      { id: 1, sender: "them", text: "Assalamualaikum! I saw your profile.", time: "Yesterday", status: "read" },
      { id: 2, sender: "me", text: "Sure, InshaAllah we can connect.", time: "Yesterday", status: "read" },
      { id: 3, sender: "them", text: "Sure, InshaAllah.", time: "Yesterday", status: "read" },
    ],
    typing: false,
  },
  7: {
    messages: [
      { id: 1, sender: "them", text: "Hello! Is everything okay?", time: "Yesterday", status: "read" },
      { id: 2, sender: "me", text: "Yes, Alhamdulillah.", time: "Yesterday", status: "read" },
      { id: 3, sender: "them", text: "Okay, will do.", time: "Yesterday", status: "read" },
    ],
    typing: false,
  },
  8: {
    messages: [
      { id: 1, sender: "them", text: "Assalamualaikum! 🌙", time: "2d ago", status: "read" },
      { id: 2, sender: "me", text: "Walaikumassalam Maria!", time: "2d ago", status: "read" },
      { id: 3, sender: "them", text: "Good night! ✨", time: "2d ago", status: "read" },
    ],
    typing: false,
  },
};

// Per-user profile data for the right panel
const USER_PROFILES = {
  1: { profession: "Doctor", location: "Lahore, Pakistan", region: "Lahore, Punjab", education: "MBBS - KEMU", sect: "Sunni", interests: ["Reading Books", "Traveling", "Cooking", "Nature", "Coffee", "Photography"], age: 25, media: ["/images/profile_f1.jpg", "/images/profile_f2.jpg", "/images/profile_f3.jpg", "/images/profile_f4.jpg"] },
  2: { profession: "Software Engineer", location: "Islamabad, Pakistan", region: "Islamabad", education: "BS Computer Science - FAST", sect: "Sunni", interests: ["Coding", "Reading", "Hiking", "Coffee", "Photography"], age: 26, media: ["/images/profile_f2.jpg", "/images/profile_f3.jpg", "/images/profile_f4.jpg", "/images/profile_f5.jpg"] },
  3: { profession: "Teacher", location: "Rawalpindi, Pakistan", region: "Rawalpindi, Punjab", education: "MA English - Punjab University", sect: "Sunni", interests: ["Teaching", "Books", "Traveling", "Cooking", "Nature"], age: 24, media: ["/images/profile_f3.jpg", "/images/profile_f4.jpg", "/images/profile_f5.jpg", "/images/profile_f6.jpg"] },
  4: { profession: "Pharmacist", location: "Karachi, Pakistan", region: "Karachi, Sindh", education: "Doctor of Pharmacy - DOW", sect: "Sunni", interests: ["Healthcare", "Cooking", "Traveling", "Reading"], age: 23, media: ["/images/profile_f4.jpg", "/images/profile_f5.jpg", "/images/profile_f6.jpg", "/images/profile_f7.jpg"] },
  5: { profession: "Content Writer", location: "Multan, Pakistan", region: "Multan, Punjab", education: "BA Journalism", sect: "Sunni", interests: ["Writing", "Reading", "Coffee", "Photography"], age: 24, media: ["/images/profile_f6.jpg", "/images/profile_f7.jpg", "/images/profile_f8.jpg", "/images/profile_f1.jpg"] },
  6: { profession: "Business Analyst", location: "Lahore, Pakistan", region: "Lahore, Punjab", education: "BBA - LUMS", sect: "Sunni", interests: ["Business", "Traveling", "Coffee", "Nature"], age: 26, media: ["/images/profile_f7.jpg", "/images/profile_f8.jpg", "/images/profile_f1.jpg", "/images/profile_f2.jpg"] },
  7: { profession: "UI/UX Designer", location: "Islamabad, Pakistan", region: "Islamabad", education: "BS Design - NUST", sect: "Sunni", interests: ["Design", "Art", "Photography", "Coffee"], age: 25, media: ["/images/profile_f8.jpg", "/images/profile_f1.jpg", "/images/profile_f2.jpg", "/images/profile_f3.jpg"] },
  8: { profession: "Graphic Designer", location: "Faisalabad, Pakistan", region: "Faisalabad, Punjab", education: "BFA - NCA", sect: "Sunni", interests: ["Art", "Design", "Nature", "Cooking"], age: 25, media: ["/images/profile_f5.jpg", "/images/profile_f6.jpg", "/images/profile_f7.jpg", "/images/profile_f8.jpg"] },
};

const INITIAL_CONVERSATIONS = [
  { id: 1, name: "Ayesha Khan", avatar: "/images/profile_f1.jpg", lastMessage: "That sounds great! 😊", time: "2m ago", unread: 2, online: true, archived: false },
  { id: 2, name: "Fatima Ali", avatar: "/images/profile_f2.jpg", lastMessage: "I sent you my preferences.", time: "15m ago", unread: 1, online: true, archived: false },
  { id: 3, name: "Zainab Malik", avatar: "/images/profile_f3.jpg", lastMessage: "JazakAllah! 😊", time: "1h ago", unread: 0, online: true, archived: false },
  { id: 4, name: "Hira Ahmed", avatar: "/images/profile_f4.jpg", lastMessage: "Looking forward to it!", time: "2h ago", unread: 0, online: false, archived: false },
  { id: 5, name: "Sarah Batool", avatar: "/images/profile_f6.jpg", lastMessage: "Thanks a lot! 👍", time: "3h ago", unread: 0, online: false, archived: false },
  { id: 6, name: "Laiba Zaidi", avatar: "/images/profile_f7.jpg", lastMessage: "Sure, InshaAllah.", time: "Yesterday", unread: 0, online: false, archived: true },
  { id: 7, name: "Sana Tariq", avatar: "/images/profile_f8.jpg", lastMessage: "Okay, will do.", time: "Yesterday", unread: 0, online: true, archived: true },
  { id: 8, name: "Maria Noor", avatar: "/images/profile_f5.jpg", lastMessage: "Good night! ✨", time: "2d ago", unread: 0, online: false, archived: true },
];

// ── Context Menu ──────────────────────────────────────────────────────────────
const ConvoContextMenu = ({ x, y, chat, onClose, onArchive, onDelete, onMute, onMark }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: "fixed", top: y, left: x, zIndex: 1000 }}
      className="bg-white border border-slate-100 rounded-[14px] shadow-xl py-1.5 w-[180px]">
      {[
        { icon: <Inbox size={14} />, label: chat.unread > 0 ? "Mark as Read" : "Mark as Unread", action: onMark },
        { icon: <BellOff size={14} />, label: "Mute", action: onMute },
        { icon: <Archive size={14} />, label: chat.archived ? "Unarchive" : "Archive", action: onArchive },
        { icon: <Flag size={14} />, label: "Report", action: onClose },
        { icon: <Trash2 size={14} />, label: "Delete Chat", action: onDelete, danger: true },
      ].map((item) => (
        <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium bg-transparent border-none cursor-pointer text-left hover:bg-slate-50 ${item.danger ? "text-red-500 hover:bg-red-50" : "text-slate-700"}`}>
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mobileView, setMobileView] = useState("list");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'archive'
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState(1);
  const [chatData, setChatData] = useState(INITIAL_CHAT_DATA);
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, chat }
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData, activeChatId]);

  const activeUser = conversations.find((c) => c.id === activeChatId);
  const activeMessages = chatData[activeChatId]?.messages || [];
  const activeTyping = chatData[activeChatId]?.typing || false;
  const activeProfile = USER_PROFILES[activeChatId] || {};

  const totalUnread = conversations.filter((c) => !c.archived).reduce((a, c) => a + c.unread, 0);
  const unreadCount = conversations.filter((c) => !c.archived && c.unread > 0).length;

  // ── Filter conversations by tab & search ─────────────────────────────────
  const visibleConversations = conversations.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === "unread") return !c.archived && c.unread > 0;
    if (activeTab === "archive") return c.archived;
    return !c.archived; // 'all'
  });

  // ── Select chat ──────────────────────────────────────────────────────────
  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setMobileView("chat");
    setShowEmoji(false);
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg = { id: Date.now(), sender: "me", text: inputText.trim(), time: now, status: "sent" };
    setChatData((prev) => ({
      ...prev,
      [activeChatId]: { ...prev[activeChatId], messages: [...(prev[activeChatId]?.messages || []), newMsg] },
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, lastMessage: inputText.trim(), time: "Just now" } : c))
    );
    setInputText("");
    textareaRef.current?.focus();
  }, [inputText, activeChatId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  // ── Context menu actions ─────────────────────────────────────────────────
  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, chat });
  };

  const ctxArchive = (chat) => setConversations((prev) => prev.map((c) => c.id === chat.id ? { ...c, archived: !c.archived } : c));
  const ctxDelete = (chat) => { setConversations((prev) => prev.filter((c) => c.id !== chat.id)); if (activeChatId === chat.id) setActiveChatId(conversations[0]?.id); };
  const ctxMark = (chat) => setConversations((prev) => prev.map((c) => c.id === chat.id ? { ...c, unread: c.unread > 0 ? 0 : 1 } : c));
  const ctxMute = () => {}; // visual-only

  return (
    <div className="flex h-[calc(100vh-72px)] bg-white overflow-hidden relative w-full">

      {/* Context Menu */}
      {contextMenu && (
        <ConvoContextMenu
          x={contextMenu.x} y={contextMenu.y} chat={contextMenu.chat}
          onClose={() => setContextMenu(null)}
          onArchive={() => ctxArchive(contextMenu.chat)}
          onDelete={() => ctxDelete(contextMenu.chat)}
          onMute={ctxMute}
          onMark={() => ctxMark(contextMenu.chat)}
        />
      )}

      {/* ── LEFT COLUMN ─────────────────────────────────────────────────────── */}
      <div className={`w-full md:w-[320px] lg:w-[340px] bg-white border-r border-slate-100 flex flex-col shrink-0 transition-all duration-300 z-10
        ${mobileView === "chat" ? "-translate-x-full absolute md:relative md:translate-x-0 h-full" : "translate-x-0 h-full"}`}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={22} className="text-[#E91E63]" />
            <h2 className="text-[18px] font-bold text-slate-800 m-0">Messages</h2>
            {totalUnread > 0 && (
              <span className="bg-[#E91E63] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">{totalUnread}</span>
            )}
          </div>
          <button className="w-8 h-8 rounded-[8px] border border-pink-100 flex items-center justify-center text-[#E91E63] hover:bg-pink-50 transition-colors cursor-pointer bg-white">
            <Edit size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search conversations..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-transparent rounded-[12px] py-2.5 pl-9 pr-4 text-[13px] text-slate-700 focus:outline-none focus:border-slate-200 focus:bg-white transition-colors placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="w-[38px] h-[38px] shrink-0 rounded-[12px] border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
            <Filter size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-100 px-2">
          {[
            { id: "all", label: "All", badge: conversations.filter(c => !c.archived).length },
            { id: "unread", label: "Unread", badge: unreadCount > 0 ? unreadCount : null },
            { id: "archive", label: "Archive", badge: conversations.filter(c => c.archived).length > 0 ? conversations.filter(c => c.archived).length : null },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer bg-transparent
                ${activeTab === tab.id ? "border-[#E91E63] text-[#E91E63]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
              {tab.badge != null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none font-bold ${activeTab === tab.id ? "bg-pink-100 text-[#E91E63]" : "bg-slate-100 text-slate-500"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-1">
          {visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center py-12">
              <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
                {activeTab === "archive" ? <Archive size={24} className="text-[#E91E63]" /> :
                  activeTab === "unread" ? <Inbox size={24} className="text-[#E91E63]" /> :
                  <Search size={24} className="text-[#E91E63]" />}
              </div>
              <p className="text-[14px] font-semibold text-slate-700">
                {activeTab === "archive" ? "No archived chats" : activeTab === "unread" ? "All caught up!" : "No conversations found"}
              </p>
              <p className="text-[12px] text-slate-400">
                {activeTab === "archive" ? "Archived conversations appear here." : activeTab === "unread" ? "You have no unread messages." : "Try a different search term."}
              </p>
            </div>
          ) : (
            visibleConversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-r-[3px] group
                  ${activeChatId === chat.id ? "bg-[#fff0f5] border-[#E91E63]" : "hover:bg-slate-50 border-transparent"}`}
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-[46px] h-[46px] rounded-full object-cover border border-slate-100" />
                  {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-[14px] truncate m-0 ${chat.unread > 0 ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>
                      {chat.name}
                    </h3>
                    <span className={`text-[11px] whitespace-nowrap ml-2 ${chat.unread > 0 ? "font-bold text-[#E91E63]" : "font-medium text-slate-400"}`}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[12px] truncate m-0 ${chat.unread > 0 ? "font-medium text-slate-700" : "text-slate-500"}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 shrink-0 rounded-full bg-[#E91E63] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom: View Archived / Unarchive */}
        <div className="p-3 border-t border-slate-100 shrink-0 bg-white">
          {activeTab === "archive" ? (
            <button onClick={() => setActiveTab("all")} className="w-full flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:bg-slate-50 py-2.5 px-4 rounded-[12px] transition-colors cursor-pointer bg-transparent border-none">
              <ChevronLeft size={16} /> Back to All Messages
            </button>
          ) : (
            <button onClick={() => setActiveTab("archive")} className="w-full flex items-center gap-2 text-[13px] font-bold text-[#E91E63] hover:bg-pink-50 py-2.5 px-4 rounded-[12px] transition-colors cursor-pointer bg-transparent border-none">
              <Archive size={16} /> View Archived ({conversations.filter(c => c.archived).length})
            </button>
          )}
        </div>
      </div>

      {/* ── CENTER COLUMN ───────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col bg-[#fafbfc] relative transition-all duration-300
        ${mobileView === "list" ? "translate-x-full absolute md:relative md:translate-x-0 h-full w-full" : "translate-x-0 h-full w-full"}`}>

        {/* Chat Header */}
        <div className="h-[70px] px-4 md:px-5 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden w-9 h-9 mr-1 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 border-none cursor-pointer hover:bg-slate-100" onClick={() => setMobileView("list")}>
              <ChevronLeft size={20} />
            </button>
            <div className="relative">
              <img src={activeUser?.avatar} alt={activeUser?.name} className="w-[42px] h-[42px] rounded-full object-cover border border-slate-100" />
              {activeUser?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 m-0 leading-tight">{activeUser?.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {activeUser?.online
                  ? <><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /><span className="text-[11px] font-medium text-green-600">Online</span></>
                  : <span className="text-[11px] font-medium text-slate-400">Offline</span>
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[Search, Phone, Video, MoreVertical].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent border-none">
                <Icon size={18} strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar flex flex-col gap-3">
          <div className="flex justify-center mb-2">
            <span className="bg-white border border-slate-100 text-slate-500 text-[11px] font-medium px-4 py-1.5 rounded-full shadow-sm">Today</span>
          </div>

          {activeMessages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div key={msg.id} className={`flex flex-col max-w-[80%] md:max-w-[68%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                <div className={`px-4 py-2.5 rounded-[18px] text-[13px] md:text-[14px] leading-relaxed shadow-sm
                  ${isMe ? "bg-[#fff0f5] text-slate-800 rounded-br-[4px]" : "bg-white border border-slate-100 text-slate-800 rounded-bl-[4px]"}`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                  {isMe && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#E91E63]">
                      <path d="M18 6L7 17L2 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 6L11 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {activeTyping && (
            <div className="flex items-start self-start">
              <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-[4px] shadow-sm flex items-center gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <div key={delay} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 relative">
          {showEmoji && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />}
          <div className="flex items-end gap-2">
            <button className="w-10 h-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-[#E91E63] mb-1 cursor-pointer bg-transparent border-none transition-colors">
              <Paperclip size={20} className="rotate-45" />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full bg-[#f8f9fa] border border-slate-100 rounded-2xl py-3 pl-4 pr-12 text-[14px] text-slate-700 focus:outline-none focus:border-slate-300 focus:bg-white resize-none min-h-[48px] max-h-[120px] transition-colors"
                rows={1}
              />
              <button
                onClick={() => setShowEmoji((p) => !p)}
                className={`absolute right-4 bottom-[12px] cursor-pointer bg-transparent border-none transition-colors ${showEmoji ? "text-[#E91E63]" : "text-slate-400 hover:text-[#E91E63]"}`}>
                <Smile size={20} />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-[48px] h-[48px] shrink-0 bg-[#E91E63] text-white rounded-full flex items-center justify-center hover:bg-[#d81557] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md border-none cursor-pointer">
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN ────────────────────────────────────────────────────── */}
      <div className="hidden xl:flex w-[320px] bg-white border-l border-slate-100 flex-col overflow-y-auto no-scrollbar shrink-0 h-full">
        <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-slate-50">
          <div className="relative mb-4 mt-2">
            <img src={activeUser?.avatar} alt={activeUser?.name} className="w-[100px] h-[100px] rounded-full object-cover shadow-sm border-[3px] border-white ring-1 ring-slate-100" />
            {activeUser?.online && <div className="absolute bottom-2 right-1.5 w-[13px] h-[13px] bg-green-500 rounded-full border-2 border-white" />}
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-[17px] font-bold text-slate-800 m-0">{activeUser?.name}, {activeProfile.age}</h2>
            <CheckCircle2 size={15} fill="#E91E63" color="white" />
          </div>
          <p className="text-[13px] font-medium text-slate-500 m-0 mb-1">{activeProfile.profession}</p>
          <div className="flex items-center justify-center gap-1 text-[12px] text-slate-400 mb-5">
            <MapPin size={12} /> {activeProfile.location}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 w-full">
            {[
              { icon: <User size={17} strokeWidth={2.5} />, label: "View Profile", pink: true, action: () => navigate(`/profile/${activeChatId}`) },
              { icon: <Heart size={17} />, label: "Interest", action: () => {} },
              { icon: <Star size={17} />, label: "Favorites", action: () => navigate("/favorites") },
              { icon: <MoreHorizontal size={17} />, label: "More", action: () => {} },
            ].map((btn) => (
              <div key={btn.label} className="flex flex-col items-center gap-1.5">
                <button onClick={btn.action}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors cursor-pointer shadow-sm
                    ${btn.pink ? "border-pink-200 bg-[#fff0f5] text-[#E91E63] hover:bg-pink-100" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {btn.icon}
                </button>
                <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{btn.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6 pt-5 flex flex-col gap-4">
          {/* About */}
          <div className="bg-[#fafbfc] rounded-[20px] p-4 border border-slate-100">
            <h3 className="text-[13px] font-bold text-slate-800 mb-3.5">About {activeUser?.name.split(" ")[0]}</h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: <GraduationCap size={14} />, text: activeProfile.education },
                { icon: <MapPin size={14} />, text: activeProfile.region },
                { icon: <Book size={14} />, text: activeProfile.sect },
                { icon: <Coffee size={14} />, text: activeProfile.interests?.slice(0, 3).join(", ") },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[12px] text-slate-600">
                  <span className="text-slate-400 shrink-0 mt-0.5">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <Link to={`/profile/${activeChatId}`} className="text-[12px] font-bold text-[#E91E63] no-underline hover:opacity-80 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100">
              View Full Profile <ChevronRight size={12} />
            </Link>
          </div>

          {/* Shared Interests */}
          <div className="bg-[#fafbfc] rounded-[20px] p-4 border border-slate-100">
            <h3 className="text-[13px] font-bold text-slate-800 mb-3">Shared Interests</h3>
            <div className="flex flex-wrap gap-1.5">
              {(activeProfile.interests || []).map((tag) => (
                <span key={tag} className="text-[11px] font-medium text-[#E91E63] bg-[#fff0f5] py-1 px-2.5 rounded-full border border-pink-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className="bg-[#fafbfc] rounded-[20px] p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-slate-800 m-0">Media</h3>
              <button className="text-[11px] font-bold text-[#E91E63] bg-transparent border-none cursor-pointer hover:opacity-80">View All</button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(activeProfile.media || []).map((src, i) => (
                <div key={i} className="aspect-square rounded-[10px] bg-slate-100 overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MessagesPage;
