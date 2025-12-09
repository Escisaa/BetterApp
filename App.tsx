import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import Auth from "./components/Auth";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import { supabase } from "./services/supabaseClient";
import { checkLicenseStatus } from "./services/licenseService";

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111213] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1C1C1E] border border-gray-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Please refresh the page or try
              again later.
            </p>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Go to Home
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="ml-3 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Reload Page
            </button>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="text-gray-500 text-sm cursor-pointer">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-gray-900 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-[#111213] text-gray-100">
          <Routes>
            <Route path="/" element={<LandingPageWrapper />} />
            <Route path="/auth" element={<AuthWrapper />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
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
      <Analytics />
    </ErrorBoundary>
  );
};

export default App;
