import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ChatGPT Image Jul 27, 2026, 03_32_07 AM.png";

const publicNavItems = [
  { to: "/#home", label: "Home" },
  { to: "/#why", label: "About" },
  { to: "/#stories", label: "Success Stories" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/#contact", label: "Contact" },
];

const privateNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/matches", icon: Crown, label: "Matches" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/subscription", icon: Crown, label: "Pricing" },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authenticated = Boolean(user);

  const navItems = useMemo(
    () => (authenticated ? privateNavItems : publicNavItems),
    [authenticated],
  );

  const currentPath = `${location.pathname}${location.hash}`;

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e8e3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Life Partner"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="brand-font text-[40px] leading-none text-[#154a43]">
                Life Partner
              </p>
              <p className="text-xs text-[#819099]">
                Find your partner for life
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 xl:flex">
            {authenticated
              ? navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-[15px] font-medium ${isActive ? "border-b-2 border-[#0e6254] pb-2 text-[#0e6254]" : "text-[#44535d]"}`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))
              : navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`text-[15px] font-medium text-[#44535d] ${currentPath === item.to ? "border-b-2 border-[#0e6254] pb-2 text-[#0e6254]" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
          </nav>
        </div>

        {authenticated ? (
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#d8a847] px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </button>
            <button
              className="rounded-full border border-[#d7dde2] p-2.5 text-[#6b7983]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-[#e1e6ea] px-2 py-1.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0f6255] to-[#d8b57a] text-white">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#233139]">
                    {user?.name ?? "Mubashir Mustafa"}
                  </p>
                  <p className="text-xs text-[#73828d]">Profile</p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#88949d]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                  <Link
                    to="/profile/me"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound className="h-4 w-4 text-slate-400" />
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 xl:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-[#ccd4d9] bg-white px-6 py-2.5 text-sm font-semibold text-[#2e3a43]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-[#0f5d52] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {authenticated && mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 xl:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"}`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
