import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import Auth from "./components/Auth";
import { supabase } from "./services/supabaseClient";
import { checkLicenseStatus } from "./services/licenseService";

// Protected Route Component - Requires authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111213] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Landing Page with navigation
const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
};

// Auth wrapper
const AuthWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/dashboard");
  };

  return <Auth onAuthSuccess={handleAuthSuccess} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111213] text-gray-100">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/auth" element={<AuthWrapper />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
