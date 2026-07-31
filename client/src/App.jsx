import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";

// Authenticated layout + pages
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import ProfileViewPage from "./pages/ProfileViewPage";
import PlaceholderPage from "./components/PlaceholderPage";

// ── Guards ─────────────────────────────────────────────────────────────────

// Redirect logged-in users away from public-only pages (landing, login, register)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Redirect unauthenticated users to login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

// ── App Shell ──────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      {/* ── Public-only (redirect to dashboard if already logged in) ── */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <LandingPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Profile setup — accessible after register before login-wall */}
      <Route path="/profile-setup" element={<ProfileSetupPage />} />

      {/* ── Protected routes — all share the persistent AppLayout navbar ── */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/matches" element={<PlaceholderPage title="Matches" description="Your curated compatibility matches." />} />
        <Route path="/messages" element={<PlaceholderPage title="Messages" description="Your conversations and connection requests." />} />
        <Route path="/shortlisted" element={<PlaceholderPage title="Shortlisted" description="Profiles you've shortlisted." />} />
        <Route path="/visitors" element={<PlaceholderPage title="Visitors" description="People who viewed your profile." />} />
        <Route path="/subscription" element={<PlaceholderPage title="Packages" description="Upgrade your membership plan." />} />
        <Route path="/profile/me" element={<PlaceholderPage title="My Profile" description="View and edit your profile." />} />
        <Route path="/profile/:id" element={<ProfileViewPage />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" description="Manage your account and privacy." />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
