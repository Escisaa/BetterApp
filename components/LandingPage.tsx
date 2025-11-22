import React from "react";
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
      className="flex flex-col min-h-screen bg-[#111213] text-gray-100"
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
            <span className="font-semibold text-xl tracking-tight text-white">
              BetterApp
            </span>
          </motion.div>
          <nav className="hidden sm:flex items-center space-x-8 text-sm font-medium text-gray-400">
            <motion.a
              href="#"
              className="hover:text-white"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#pricing"
              className="hover:text-white"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Pricing
            </motion.a>
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
              className="inline-block bg-gray-800 text-gray-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              ✨ Made for indie iOS developers
            </motion.div>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tighter leading-tight"
              variants={fadeInUp}
            >
              Understand your competition.
              <br />
              Build better apps.
            </motion.h1>
            <motion.p
              className="max-w-2xl mx-auto mt-6 text-lg text-gray-400"
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
              <motion.a
                href="https://github.com/Escisaa/BetterApp/releases/download/v1.0.0/BetterApp-1.0.0-arm64.dmg"
                download="BetterApp.dmg"
                className="bg-transparent text-white font-semibold px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors shadow-sm inline-block"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Install Desktop App
              </motion.a>
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
