import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import InAction from "./InAction";
import ChatDemo from "./ChatDemo";
import MobileMockupSection from "./MobileMockupSection";
import FAQ from "./FAQ";
import Footer from "./Footer";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted = () => {},
}) => {
  const [isDark, setIsDark] = useState(true);

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
              className="mt-10 flex justify-center items-center space-x-4"
              variants={fadeInUp}
            >
              <motion.button
                onClick={() => {
                  const pricingElement = document.getElementById("pricing");
                  if (pricingElement) {
                    pricingElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors shadow-md shadow-orange-900/50"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Subscribe
              </motion.button>
              <div className="flex flex-col items-center">
                <motion.a
                  href="https://github.com/Escisaa/BetterApp/releases/download/v1.0.0/BetterApp-1.0.0-arm64.dmg"
                  download="BetterApp.dmg"
                  onClick={(e) => {
                    // Show helpful instructions for macOS users
                    if (navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
                      e.preventDefault();
                      const instructions = `📥 Download Instructions for macOS:

1. Click "Download" below to get the app
2. Open your Downloads folder
3. Right-click the BetterApp.dmg file
4. Select "Open" (don't double-click)
5. Click "Open" in the security dialog
6. Drag BetterApp to Applications

This is normal for indie apps - macOS just needs confirmation it's safe!`;

                      if (
                        window.confirm(
                          instructions +
                            "\n\nClick OK to download, or Cancel to read this again."
                        )
                      ) {
                        window.location.href =
                          "https://github.com/Escisaa/BetterApp/releases/download/v1.0.0/BetterApp-1.0.0-arm64.dmg";
                      }
                    }
                  }}
                  className={`bg-transparent font-semibold px-6 py-3 rounded-lg border ${
                    isDark
                      ? "text-white border-gray-700 hover:bg-gray-800"
                      : "text-gray-900 border-gray-300 hover:bg-gray-50"
                  } transition-colors shadow-sm inline-block relative group`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  title="macOS users: Right-click → Open after download"
                >
                  Install Desktop App
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    macOS
                  </span>
                </motion.a>
                <p
                  className={`text-xs mt-2 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Available for macOS 13 and up
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <MobileMockupSection />
        <InAction />
        <ChatDemo />

        {/* Pricing Section */}
        <motion.section
          id="pricing"
          className="py-24 bg-[#111213]"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                Simple, transparent{" "}
                <span className="text-orange-400">pricing</span>
              </h2>
              <p className="text-gray-400 text-lg">
                One license, one Mac, all features included
              </p>
            </motion.div>

            <div className="flex justify-center max-w-2xl mx-auto">
              {/* Single Yearly Plan - Like Astro */}
              <motion.div
                className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-8 w-full"
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  Single Mac License
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-white">
                    £10
                  </span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  £120 billed annually
                </p>
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-300">
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
                    <li className="flex items-center text-gray-300">
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
                    <li className="flex items-center text-gray-300">
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
                      "How to Beat Them" Competitive Intelligence
                    </li>
                    <li className="flex items-center text-gray-300">
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
                    <li className="flex items-center text-gray-300">
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
                    <li className="flex items-center text-gray-300">
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
                    try {
                      // Use relative URLs in production (same domain), otherwise use env var
                      const API_URL =
                        typeof window !== "undefined" &&
                        window.location.hostname !== "localhost" &&
                        !window.location.hostname.includes("127.0.0.1")
                          ? "" // Production: use relative URL (same domain)
                          : (
                              import.meta.env.VITE_API_URL ||
                              "http://localhost:3002"
                            ).replace(/[.\/]+$/, "");
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
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        alert("Failed to start checkout. Please try again.");
                      }
                    } catch (error) {
                      console.error("Checkout error:", error);
                      alert("Failed to start checkout. Please try again.");
                    }
                  }}
                  className="w-full bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Subscribe
                </button>
                <p className="text-gray-500 text-xs text-center mt-4">
                  Invoices and receipts available for easy company
                  reimbursement.
                  <br />
                  Prices in GBP. Taxes may apply.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <FAQ />
      </main>
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
