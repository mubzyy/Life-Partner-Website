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
import MatchesPage from "./pages/MatchesPage";
import MessagesPage from "./pages/MessagesPage";
import ProfileViewPage from "./pages/ProfileViewPage";
import MyProfilePage from "./pages/MyProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import VisitorsPage from "./pages/VisitorsPage";
import NotificationsPage from "./pages/NotificationsPage";
import PricingPage from "./pages/PricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import SettingsPage from "./pages/SettingsPage";
import BlockedUsersPage from "./pages/BlockedUsersPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./components/PlaceholderPage";

// Admin CRM — a completely separate module. Its own login (username, not
// email), its own auth context/token/storage key, its own layout, its own
// nav. A regular customer session and an admin session are two unrelated
// things that never reference or redirect into each other. AdminRoute below
// is just so the CRM shell never flashes on screen before a non-admin is
// bounced — the REAL gate is server-side: every /api/admin/* call is
// independently re-verified by middleware/adminSessionAuth.js against a JWT
// signed with a completely different secret than customer tokens use.
import { AdminAuthProvider, useAdminAuth } from "./admin/context/AdminAuthContext";
import AdminLoginPage from "./admin/AdminLoginPage";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminProfiles from "./admin/pages/AdminProfiles";
import AdminVerifications from "./admin/pages/AdminVerifications";
import AdminReports from "./admin/pages/AdminReports";
import AdminSubscriptions from "./admin/pages/AdminSubscriptions";
import AdminPayments from "./admin/pages/AdminPayments";
import AdminNotifications from "./admin/pages/AdminNotifications";
import AdminSettings from "./admin/pages/AdminSettings";

// ── Guards ─────────────────────────────────────────────────────────────────

// Redirect logged-in customers away from public-only pages (landing, login, register)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Redirect unauthenticated users to login, and incomplete profiles to setup
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  // Temporarily allow navigation without requiring profile completion
  // if (!user.profileComplete) return <Navigate to="/profile-setup" replace />;
  return children;
};

// Redirect an already-logged-in admin away from the admin login page.
const AdminPublicOnlyRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  return admin ? <Navigate to="/admin" replace /> : children;
};

// Admin-only gate — checks the SEPARATE admin session, never the customer
// `user`. A non-admin (or logged-out visitor) hitting any /admin/* URL
// directly is sent to the admin login, not the customer one.
const AdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

// Route only for incomplete profiles or editing
const SetupRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  // Removed the redirection away from /profile-setup so users can edit their profiles
  return children;
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
      <Route 
        path="/profile-setup" 
        element={
          <SetupRoute>
            <ProfileSetupPage />
          </SetupRoute>
        } 
      />

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
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/visitors" element={<VisitorsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/subscription" element={<PricingPage />} />
        <Route path="/packages" element={<PricingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile/me" element={<MyProfilePage />} />
        <Route path="/profile/:id" element={<ProfileViewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/blocked-users" element={<BlockedUsersPage />} />
        <Route path="/settings/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* ── Admin CRM — completely separate module, own login, own layout ── */}
      <Route
        path="/admin/login"
        element={
          <AdminPublicOnlyRoute>
            <AdminLoginPage />
          </AdminPublicOnlyRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="profiles" element={<AdminProfiles />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
