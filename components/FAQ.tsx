import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon } from './Icons';

const faqData = [
  {
    question: "What is AppScope?",
    answer: "AppScope is a powerful competitor analysis tool for mobile app developers and product managers. It uses AI to analyze user reviews, market data, and app performance metrics to provide actionable insights that help you build better products and make smarter business decisions."
  },
  {
    question: "How does the AI analysis work?",
    answer: "Our AI, powered by Google's Gemini models, reads through thousands of user reviews for any app you search. It identifies recurring themes, common complaints, feature requests, and sentiment towards monetization. It then synthesizes this information into a concise, easy-to-digest report."
  },
  {
    question: "Is the app data accurate?",
    answer: "We source our data directly from public App Store APIs. While we strive for the highest accuracy, metrics like downloads and revenue are estimations based on market models and may vary. Review data is pulled in near real-time."
  },
  {
    question: "Can I analyze any app on the App Store?",
    answer: "Yes, you can search for and analyze any app available on the US Apple App Store. We are working on expanding support for other countries and the Google Play Store in the future."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, you can try our demo to get a feel for the platform. For full access to all features, including unlimited analyses and competitor tracking, you'll need to subscribe to one of our premium plans."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section 
      ref={ref}
      className="py-20 sm:py-28 bg-[#111213]"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">
            Frequently Asked Questions
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">
            Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </motion.div>
        <div className="mt-12 space-y-4">
          {faqData.map((item, index) => (
            <motion.div 
              key={index} 
              className="border border-gray-800 rounded-lg bg-[#1C1C1E]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left p-6"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-lg font-medium text-white">{item.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === index ? <MinusIcon className="w-6 h-6 text-gray-400" /> : <PlusIcon className="w-6 h-6 text-gray-400" />}
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    className="px-6 pb-6 text-gray-400 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p>{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FAQ;