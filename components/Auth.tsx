import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { motion } from "framer-motion";
import Logo from "./Logo";

interface AuthProps {
  isDark?: boolean;
  onAuthSuccess?: () => void;
}

const Auth: React.FC<AuthProps> = ({ isDark = true, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) {
          console.error("Sign up error:", signUpError);
          // Provide more helpful error messages
          if (signUpError.message.includes("Invalid API key")) {
            setError(
              "Configuration error: Invalid Supabase API key. Please contact support."
            );
          } else if (signUpError.message.includes("Email rate limit")) {
            setError("Too many sign-up attempts. Please try again later.");
          } else {
            setError(signUpError.message || "Failed to create account");
          }
          return;
        }

        if (data.session) {
          // Session created - user is logged in immediately
          setMessage("Account created! Redirecting...");
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess();
            window.location.href = "/dashboard";
          }, 1000);
        } else if (data.user && !data.session) {
          // Email confirmation required
          setMessage(
            "Check your email for the confirmation link to complete sign up!"
          );
          // Optionally auto-redirect to sign in after a delay
          setTimeout(() => {
            setIsSignUp(false);
            setMessage("You can sign in after confirming your email.");
          }, 3000);
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

        if (signInError) {
          console.error("Sign in error:", signInError);
          // Provide more helpful error messages
          if (signInError.message.includes("Invalid API key")) {
            setError(
              "Configuration error: Invalid Supabase API key. Please contact support."
            );
          } else if (
            signInError.message.includes("Invalid login credentials")
          ) {
            setError("Invalid email or password. Please try again.");
          } else {
            setError(signInError.message || "Failed to sign in");
          }
          return;
        }

        if (data.session) {
          setMessage("Signed in! Redirecting...");
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess();
            window.location.href = "/dashboard";
          }, 500);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? "bg-[#111213]" : "bg-gray-50"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDark ? "bg-[#1C1C1E]" : "bg-white"} border ${
          isDark ? "border-gray-800" : "border-gray-200"
        } rounded-2xl w-full max-w-md p-8 shadow-2xl`}
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={48} className="rounded-lg" />
          </div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {isSignUp
              ? "Sign up to get started with BetterApp"
              : "Sign in to your BetterApp account"}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
            {message}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isSignUp ? "Creating..." : "Signing in..."}
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className={`text-sm ${
              isDark
                ? "text-gray-400 hover:text-orange-400"
                : "text-gray-600 hover:text-orange-600"
            } transition-colors`}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
