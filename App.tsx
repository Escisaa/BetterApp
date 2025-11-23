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
import { checkLicenseStatus } from "./services/licenseService";

// Protected Route Component - Allows access but Dashboard handles license gating
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

// Landing Page with navigation
const LandingPageWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111213] text-gray-100">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
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
