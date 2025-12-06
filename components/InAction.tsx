import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface InActionProps {
  isDark?: boolean;
}

const InAction: React.FC<InActionProps> = ({ isDark = true }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      className={`py-24 sm:py-32 px-4 ${isDark ? "bg-[#111213]" : "bg-white"}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="max-w-5xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">
          See BetterApp in action
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">
          Explore the interface and discover how easy it is to analyze
          competitors and understand the market.
        </p>
      </motion.div>

      {/* Screenshot in Mac Frame */}
      <motion.div
        className="max-w-6xl mx-auto mt-12"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={
          isInView
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 50, scale: 0.95 }
        }
        transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
      >
        <div
          className="bg-[#2a2a2a] rounded-xl overflow-hidden mx-auto"
          style={{ boxShadow: "0 25px 80px -20px rgba(0, 0, 0, 0.6)" }}
        >
          {/* Mac Title Bar */}
          <div className="bg-[#3a3a3a] px-4 py-2.5 flex items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-gray-400 text-xs font-medium">
                BetterApp — AI Competitor Analysis
              </span>
            </div>
          </div>
          <img
            src="/screenshot.landing.png"
            alt="BetterApp Dashboard - Analyze competitor apps with AI"
            className="w-full h-auto"
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default InAction;
