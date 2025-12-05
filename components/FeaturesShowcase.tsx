import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const chartData = [
  { value: 30 },
  { value: 40 },
  { value: 35 },
  { value: 50 },
  { value: 45 },
  { value: 65 },
];

// Mobile Phone Mockup
const MobilePhoneMockup = ({
  imageSrc,
  alt,
}: {
  imageSrc: string;
  alt: string;
}) => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="relative w-full max-w-xs" style={{ aspectRatio: "9/19.5" }}>
      <div
        className="absolute inset-0 bg-black rounded-3xl"
        style={{
          boxShadow:
            "0 0 0 8px #1a1a1a, 0 0 0 10px #333, 0 20px 60px -15px rgba(0, 0, 0, 0.9)",
        }}
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-3xl z-20" />
        <div
          className="absolute bg-black overflow-hidden"
          style={{
            top: "12px",
            left: "7px",
            right: "7px",
            bottom: "12px",
            borderRadius: "24px",
          }}
        >
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  </div>
);

// Desktop Mockup
const DesktopMockup = ({
  imageSrc,
  alt,
}: {
  imageSrc: string;
  alt: string;
}) => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="w-full max-w-lg">
      <div className="bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-t-3xl p-3 shadow-2xl">
        <div className="flex items-center gap-3 mb-3 px-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-lg" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-zinc-300 font-medium">BetterApp</p>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-inner border border-zinc-800">
          <img src={imageSrc} alt={alt} className="w-full h-auto" />
        </div>
      </div>
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-b-3xl px-12 py-2" />
      <div className="flex justify-center items-end gap-12 px-8 pb-3">
        <div
          className="w-1 h-6 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded"
          style={{
            transformOrigin: "center bottom",
            transform: "skewY(-15deg)",
          }}
        />
        <div
          className="w-1 h-6 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded"
          style={{
            transformOrigin: "center bottom",
            transform: "skewY(15deg)",
          }}
        />
      </div>
    </div>
  </div>
);

interface FeaturesShowcaseProps {
  isDark: boolean;
}

const FeaturesShowcase: React.FC<FeaturesShowcaseProps> = ({ isDark }) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section
      className={`w-full py-20 md:py-28 ${
        isDark ? "bg-zinc-950" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto text-balance leading-tight mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Everything you need
            <br />
            to <span className="text-orange-400">grow your app</span>
          </motion.h2>
          <motion.p
            className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-zinc-400" : "text-gray-600"
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            BetterApp provides comprehensive tools to optimize your app's
            performance and user engagement
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:auto-rows-fr">
          {/* Feature 1: Stop Guessing */}
          <motion.div
            className={`group rounded-xl p-6 md:p-8 flex flex-col transition-all duration-300 ${
              isDark
                ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-orange-500/5"
                : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
            }`}
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <h3
                className={`text-xl md:text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Stop guessing
              </h3>
              <p
                className={`text-sm md:text-base leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-gray-600"
                }`}
              >
                BetterApp tells you exactly which keywords your customers are
                using; all you have to do is include them in your metadata.
              </p>
            </div>
            <div className="flex justify-center items-center flex-1 min-h-64 md:min-h-96">
              <div className="w-48 h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-700">
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">ASO Keywords</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Discover what users search
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Middle Column: Two stacked features */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Feature 2: Results */}
            <motion.div
              className={`group rounded-xl p-6 md:p-8 flex flex-col flex-1 transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-orange-500/5"
                  : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
              }`}
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-6">
                <h3
                  className={`text-xl md:text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Results that make a difference
                </h3>
                <p
                  className={`text-sm md:text-base leading-relaxed mb-6 ${
                    isDark ? "text-zinc-400" : "text-gray-600"
                  }`}
                >
                  90% of BetterApp users experience an increase in app
                  impressions within the first week after updating their
                  metadata.
                </p>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#f97316"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#f97316"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="text-center">
                <span className="text-3xl md:text-4xl font-bold text-orange-400">
                  +35%
                </span>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-zinc-500" : "text-gray-500"
                  }`}
                >
                  Average impression increase
                </p>
              </div>
            </motion.div>

            {/* Feature: Save hours */}
            <motion.div
              className={`group rounded-xl p-6 md:p-8 flex flex-col flex-1 transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-orange-500/5"
                  : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
              }`}
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h3
                  className={`text-xl md:text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Save hours of work
                </h3>
                <p
                  className={`text-sm md:text-base leading-relaxed ${
                    isDark ? "text-zinc-400" : "text-gray-600"
                  }`}
                >
                  You don't have to search for which keywords your app is
                  ranking for. BetterApp already knows.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-zinc-300" : "text-gray-700"
                  }`}
                >
                  Instant keyword discovery
                </span>
              </div>
            </motion.div>
          </div>

          {/* Feature 3: Unlimited */}
          <motion.div
            className={`group rounded-xl p-6 md:p-8 flex flex-col transition-all duration-300 ${
              isDark
                ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-orange-500/5"
                : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
            }`}
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <h3
                className={`text-xl md:text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Unlimited
              </h3>
              <p
                className={`text-sm md:text-base leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-gray-600"
                }`}
              >
                BetterApp has a fixed annual subscription unlike all our
                competitors: if you need to track thousands of keywords, you can
                do so without paying anything extra.
              </p>
            </div>
            <div className="flex justify-center items-center flex-1 min-h-64 md:min-h-96">
              <div className="w-full max-w-sm">
                <div className="bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-t-2xl p-2 shadow-xl">
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-zinc-400">BetterApp</p>
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 p-3">
                    <div className="space-y-2">
                      {["fitness app", "workout", "health tracker"].map(
                        (kw, i) => (
                          <div
                            key={kw}
                            className="flex items-center justify-between bg-zinc-800/50 rounded px-2 py-1"
                          >
                            <span className="text-xs text-zinc-300">{kw}</span>
                            <span className="text-xs text-orange-400">
                              #{i + 1}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-b-2xl px-8 py-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
