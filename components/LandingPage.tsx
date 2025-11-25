import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import InAction from "./InAction";
import ChatDemo from "./ChatDemo";
import MobileMockupSection from "./MobileMockupSection";
import Footer from "./Footer";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted = () => {},
}) => {
  const [isDark, setIsDark] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className={`flex flex-col min-h-screen ${
        isDark ? "bg-[#111213] text-gray-100" : "bg-white text-gray-900"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header
        className="py-4 sm:py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Logo size={32} className="rounded-lg" />
            <span
              className={`font-semibold text-xl tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              BetterApp
            </span>
          </motion.div>
          <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium">
            <motion.a
              href="#"
              className={
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#pricing"
              className={
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Pricing
            </motion.a>
            <motion.button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              } transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </motion.button>
          </nav>
        </div>
      </motion.header>

      <main className="flex-grow">
        <div className="py-16 sm:py-24">
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className={`inline-block ${
                isDark
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              } text-sm font-semibold px-4 py-1.5 rounded-full mb-6`}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              ✨ Made for indie iOS developers
            </motion.div>
            <motion.h1
              className={`text-5xl sm:text-6xl md:text-7xl font-extrabold ${
                isDark ? "text-white" : "text-gray-900"
              } tracking-tighter leading-tight`}
              variants={fadeInUp}
            >
              Understand your competition.
              <br />
              Build better apps.
            </motion.h1>
            <motion.p
              className={`max-w-2xl mx-auto mt-6 text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
              variants={fadeInUp}
            >
              Chat with any app using AI, analyze competitor reviews, and
              discover market opportunities that drive real revenue growth.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-col items-center space-y-4"
              variants={fadeInUp}
            >
              <div className="flex justify-center items-center space-x-4">
                <motion.button
                  onClick={async () => {
                    if (isSubscribing) return;
                    setIsSubscribing(true);
                    try {
                      const API_URL = import.meta.env.VITE_API_URL
                        ? import.meta.env.VITE_API_URL.replace(/[.\/]+$/, "")
                        : typeof window !== "undefined" &&
                          window.location.hostname !== "localhost" &&
                          !window.location.hostname.includes("127.0.0.1")
                        ? "https://betterapp-arsv.onrender.com"
                        : "http://localhost:3002";
                      const response = await fetch(
                        `${API_URL}/api/stripe/checkout`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            successUrl: `${window.location.origin}/?success=true`,
                            cancelUrl: `${window.location.origin}/?canceled=true`,
                          }),
                        }
                      );

                      // Handle 429 rate limit errors
                      if (response.status === 429) {
                        const errorText = await response.text();
                        alert(
                          "Too many requests. Please wait a moment and try again."
                        );
                        setIsSubscribing(false);
                        return;
                      }

                      if (!response.ok) {
                        const errorText = await response.text();
                        let errorMessage =
                          "Failed to start checkout. Please try again.";
                        try {
                          const errorData = JSON.parse(errorText);
                          errorMessage =
                            errorData.message ||
                            errorData.error ||
                            errorMessage;
                        } catch {
                          // If not JSON, use the text or default message
                          if (errorText && !errorText.includes("Too many")) {
                            errorMessage = errorText;
                          }
                        }
                        alert(errorMessage);
                        setIsSubscribing(false);
                        return;
                      }

                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        alert("Failed to start checkout. Please try again.");
                        setIsSubscribing(false);
                      }
                    } catch (error) {
                      console.error("Checkout error:", error);
                      alert("Failed to start checkout. Please try again.");
                      setIsSubscribing(false);
                    }
                  }}
                  disabled={isSubscribing}
                  className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors shadow-md shadow-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={!isSubscribing ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isSubscribing ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {isSubscribing ? (
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
                      Processing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (isNavigating) return;
                    setIsNavigating(true);
                    onGetStarted();
                    // Navigate to dashboard
                    setTimeout(() => {
                      window.location.href = "/dashboard";
                    }, 100);
                  }}
                  disabled={isNavigating}
                  className={`bg-transparent font-semibold px-6 py-3 rounded-lg border ${
                    isDark
                      ? "text-white border-gray-700 hover:bg-gray-800"
                      : "text-gray-900 border-gray-300 hover:bg-gray-50"
                  } transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  whileHover={!isNavigating ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isNavigating ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {isNavigating ? (
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
                      Loading...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <MobileMockupSection isDark={isDark} />
        <InAction isDark={isDark} />
        <ChatDemo isDark={isDark} />

        {/* Pricing Section */}
        <motion.section
          id="pricing"
          className={`py-24 ${isDark ? "bg-[#111213]" : "bg-gray-50"}`}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <h2
                className={`text-4xl sm:text-5xl font-extrabold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Simple, transparent{" "}
                <span className="text-orange-400">pricing</span>
              </h2>
              <p
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                One license, one Mac, all features included
              </p>
            </motion.div>

            <div className="flex justify-center max-w-2xl mx-auto">
              {/* Single Yearly Plan - Like Astro */}
              <motion.div
                className={`rounded-2xl p-8 w-full ${
                  isDark
                    ? "bg-[#1C1C1E] border border-gray-800"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Single Mac License
                </h3>
                <div className="mb-4">
                  <span
                    className={`text-4xl font-extrabold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    £10
                  </span>
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    /month
                  </span>
                </div>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  £120 billed annually
                </p>
                <div className="mb-8">
                  <h4
                    className={`text-lg font-semibold mb-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    <li
                      className={`flex items-center ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      AI Chat with Any App
                    </li>
                    <li
                      className={`flex items-center ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      AI Review Analysis
                    </li>
                    <li
                      className={`flex items-center ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Competitive Intelligence and ASO
                    </li>
                    <li
                      className={`flex items-center ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Smart Tags & Export
                    </li>
                    <li
                      className={`flex items-center ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Keyword Tracking (ASO)
                    </li>
                    <li
                      className={`flex items-center ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Unlimited Usage
                    </li>
                  </ul>
                </div>
                <button
                  onClick={async () => {
                    if (isSubscribing) return;
                    setIsSubscribing(true);
                    try {
                      // Use Render backend URL in production (Vercel), or env var, or localhost
                      const API_URL = import.meta.env.VITE_API_URL
                        ? import.meta.env.VITE_API_URL.replace(/[.\/]+$/, "")
                        : typeof window !== "undefined" &&
                          window.location.hostname !== "localhost" &&
                          !window.location.hostname.includes("127.0.0.1")
                        ? "https://betterapp-arsv.onrender.com"
                        : "http://localhost:3002";
                      const response = await fetch(
                        `${API_URL}/api/stripe/checkout`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            successUrl: `${window.location.origin}/?success=true`,
                            cancelUrl: `${window.location.origin}/?canceled=true`,
                          }),
                        }
                      );

                      // Handle 429 rate limit errors
                      if (response.status === 429) {
                        const errorText = await response.text();
                        alert(
                          "Too many requests. Please wait a moment and try again."
                        );
                        setIsSubscribing(false);
                        return;
                      }

                      if (!response.ok) {
                        const errorText = await response.text();
                        let errorMessage =
                          "Failed to start checkout. Please try again.";
                        try {
                          const errorData = JSON.parse(errorText);
                          errorMessage =
                            errorData.message ||
                            errorData.error ||
                            errorMessage;
                        } catch {
                          // If not JSON, use the text or default message
                          if (errorText && !errorText.includes("Too many")) {
                            errorMessage = errorText;
                          }
                        }
                        alert(errorMessage);
                        setIsSubscribing(false);
                        return;
                      }

                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        alert("Failed to start checkout. Please try again.");
                        setIsSubscribing(false);
                      }
                    } catch (error) {
                      console.error("Checkout error:", error);
                      alert("Failed to start checkout. Please try again.");
                      setIsSubscribing(false);
                    }
                  }}
                  disabled={isSubscribing}
                  className="w-full bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubscribing ? (
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
                      Processing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
                <p
                  className={`text-xs text-center mt-4 ${
                    isDark ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  Invoices and receipts available for easy company
                  reimbursement.
                  <br />
                  Prices in GBP. Taxes may apply.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer isDark={isDark} />
    </motion.div>
  );
};

export default LandingPage;
