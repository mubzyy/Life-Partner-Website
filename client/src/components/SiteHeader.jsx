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
import BrandMark from "./BrandMark";
import Container from "./Container";

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
    <header className="sticky top-0 z-50 border-b border-border-light bg-background/95 backdrop-blur w-full">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4 lg:gap-12">
          <Link to="/" className="no-underline shrink-0">
            <BrandMark compact={true} />
          </Link>

          <nav className="hidden items-center gap-8 xl:flex">
            {authenticated
              ? navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-[15px] font-medium transition-colors ${isActive ? "border-b-2 border-primary pb-2 text-primary" : "text-text-secondary hover:text-primary"}`
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
                    className={`text-[15px] font-medium transition-colors ${currentPath === item.to ? "border-b-2 border-primary pb-2 text-primary" : "text-text-secondary hover:text-primary"}`}
                  >
                    {item.label}
                  </Link>
                ))}
          </nav>
        </div>

        {authenticated ? (
          <div className="flex items-center gap-4">
            <button className="hidden sm:inline-flex items-center gap-[6px] bg-primary hover:bg-primary-hover text-white rounded-lg shadow-sm hover:scale-105 transition-all px-[12px] py-[6px] text-xs font-semibold border-none cursor-pointer whitespace-nowrap">
              <Crown className="h-[14px] w-[14px]" />
              Premium
            </button>
            <button
              className="rounded-full border border-border-light p-2.5 text-text-secondary hover:text-primary transition-colors cursor-pointer bg-white"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border-light px-2 py-1.5 cursor-pointer bg-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-text-primary">
                    {user?.name ?? "Mubashir Mustafa"}
                  </p>
                  <p className="text-xs text-text-secondary">Profile</p>
                </div>
                <ChevronDown className="h-4 w-4 text-text-muted" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-14 z-50 w-52 rounded-2xl bg-card border border-border-light shadow-sm p-2">
                  <Link
                    to="/profile/me"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-slate-50"
                  >
                    <UserRound className="h-4 w-4 text-text-muted" />
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-text-muted" />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-border-light" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 bg-transparent border-none cursor-pointer"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-light bg-white text-text-secondary xl:hidden cursor-pointer"
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
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-border-light bg-white px-6 py-2.5 text-sm font-semibold text-text-primary hover:bg-slate-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm hover:scale-105 transition-all px-6 py-2.5 text-sm font-semibold"
              >
                Register
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-light bg-white text-text-secondary xl:hidden cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </Container>

      {mobileMenuOpen && (
        <div className="border-t border-border-light bg-card px-4 pb-4 pt-2 xl:hidden">
          <div className="grid gap-1">
            {authenticated ? navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-slate-50"}`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )) : navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${currentPath === item.to ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-slate-50"}`}
              >
                {item.label}
              </Link>
            ))}
            {!authenticated && (
              <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-border-light bg-white px-4 py-2.5 text-center text-sm font-semibold text-text-primary hover:bg-slate-50">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
