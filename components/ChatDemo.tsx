import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ChatDemo: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      className="py-20 sm:py-28 px-4"
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
        <motion.div
          className="inline-block bg-gray-800 text-gray-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
          }
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          ✨ New Feature
        </motion.div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">
          Chat with any app <span className="text-orange-500">using AI</span>
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">
          Ask questions about any app's features, user experience, or market
          positioning. Get instant insights powered by advanced AI analysis.
        </p>
      </motion.div>
      <motion.div
        className="max-w-4xl mx-auto mt-12 bg-[#1C1C1E] border border-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
      >
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Natural conversation about apps
            </h3>
            <ul className="space-y-3">
              {[
                "What makes this app different from competitors?",
                "What are users complaining about in reviews?",
                "How is their monetization strategy working?",
                "What features should I build next?",
              ].map((question, i) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-300">{question}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-black/20 p-4 rounded-xl space-y-4">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="relative max-w-xs">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-[#1C1C1E]">
                  U
                </div>
                <div className="bg-gray-800 text-gray-200 px-4 py-3 rounded-xl rounded-tr-none">
                  <p className="text-sm font-medium text-gray-400 mb-1">You</p>
                  <p className="text-sm">
                    What are users saying about Notion's pricing?
                  </p>
                </div>
              </div>
            </div>

            {/* AI Message */}
            <div className="flex justify-start">
              <div className="relative max-w-xs">
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-[#1C1C1E]">
                  AI
                </div>
                <div className="bg-blue-600/80 text-white px-4 py-3 rounded-xl rounded-tl-none">
                  <p className="text-sm font-medium text-blue-200 mb-1">
                    AppScope
                  </p>
                  <p className="text-sm">
                    Based on 2,847 recent reviews, users frequently mention that
                    Notion's pricing is "too expensive for personal use" but
                    "worth it for teams." 23% of negative reviews specifically
                    mention pricing concerns...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default ChatDemo;
