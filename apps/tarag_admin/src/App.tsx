import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSession } from "./context/SessionContext";
import NavBar from "./components/NavBar";
import TopBar from "./components/TopBar";

// Pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Dashboard from "./pages/main/Dashboard";
import Users from "./pages/users/Users";
import Profile from "./pages/profile/Profile";
import Alerts from "./pages/alerts/Alerts";
import System from "./pages/system/System";
import Analytics from "./pages/analytics/Analytics";
import Content from "./pages/content/Content";
import Events from "./pages/events/Events";

const App = () => {
  const { session, loading } = useSession();

  // Loader while session is being fetched
  if (loading) return <div>Loading...</div>;

  // Wrapper for protected routes
  const ProtectedOutlet = () => {
    if (!session?.user) return <Navigate to="/login" replace />;
    return (
      <div className="flex h-screen overflow-hidden">
        <NavBar />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <TopBar />
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    );
  };

  // Optionally redirect logged-in users away from login page
  const LoginRedirect = () => {
    if (session?.user) return <Navigate to="/" replace />;
    return <Login />;
  };

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedOutlet />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users/*" element={<Users />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/alerts/*" element={<Alerts />} />
        <Route path="/analytics/*" element={<Analytics />} />
        <Route path="/content/*" element={<Content />} />
        <Route path="/events/*" element={<Events />} />
        <Route path="/system/*" element={<System />} />

        {/* Add more protected pages here */}
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default App;
