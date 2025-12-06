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

// iPhone Mockup - Astro style with dynamic island
const IPhoneMockup = ({
  imageSrc,
  alt,
}: {
  imageSrc?: string;
  alt: string;
}) => (
  <div className="relative mx-auto" style={{ width: "260px" }}>
    {/* iPhone Frame */}
    <div
      className="relative bg-[#1a1a1a] rounded-[2.5rem] p-[6px]"
      style={{
        boxShadow: "0 0 0 2px #2a2a2a, 0 25px 50px -12px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Dynamic Island */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

      {/* Screen */}
      <div
        className="relative bg-[#111213] rounded-[2.25rem] overflow-hidden"
        style={{ aspectRatio: "9/19.5" }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder - App Store Search Screen */
          <div className="w-full h-full bg-[#111213] p-4 pt-10">
            {/* Status bar */}
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-white text-[10px] font-semibold">9:41</span>
              <div className="flex gap-1 items-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3C6.95 3 3 6.95 3 12s3.95 9 9 9c.9 0 1.78-.13 2.6-.38-.18-.31-.27-.66-.27-1.02 0-.55.19-1.06.52-1.46-.83.27-1.72.43-2.65.43-4.14 0-7.5-3.36-7.5-7.5S7.86 4.57 12 4.57c1.66 0 3.19.54 4.43 1.44.24-.65.72-1.19 1.32-1.54C16.29 3.54 14.23 3 12 3z" />
                </svg>
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <div className="flex items-center">
                  <div className="w-5 h-2.5 border border-white rounded-sm relative">
                    <div
                      className="absolute inset-0.5 bg-white rounded-sm"
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="bg-[#1C1C1E] rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-gray-400 text-xs">habit tracker</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["productive", "game", "loop"].map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* App result */}
            <div className="bg-[#1C1C1E] rounded-xl p-3 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl" />
                <div className="flex-1">
                  <div className="text-white text-xs font-medium">
                    Habit Tracker - HabitKit
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    Streaks & Accountability
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="text-yellow-400">★★★★★</span>
                <span>861</span>
              </div>
            </div>

            {/* More apps */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#1C1C1E] rounded-lg p-2 text-center"
                >
                  <div className="w-8 h-8 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-1" />
                  <div className="text-[8px] text-gray-400 truncate">
                    App {i}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Mac Desktop Mockup - Clean Astro style
const MacMockup = ({ imageSrc, alt }: { imageSrc?: string; alt: string }) => (
  <div className="relative mx-auto w-full max-w-lg">
    {/* Mac Frame */}
    <div
      className="bg-[#2a2a2a] rounded-lg overflow-hidden"
      style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
    >
      {/* Title bar */}
      <div className="bg-[#3a3a3a] px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-gray-400 text-[10px] font-medium">
            BetterApp — Keywords
          </span>
        </div>
      </div>

      {/* Screen content */}
      <div className="bg-[#111213]" style={{ aspectRatio: "16/10" }}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder - ASO Dashboard */
          <div className="w-full h-full p-3 flex gap-3">
            {/* Sidebar */}
            <div className="w-36 bg-[#1C1C1E] rounded-lg p-2 flex-shrink-0">
              <div className="text-white text-[10px] font-semibold mb-2 px-1">
                Apps
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-1.5 rounded-lg mb-1 ${
                    i === 1 ? "bg-orange-500/20" : ""
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`h-1.5 rounded ${
                        i === 1 ? "bg-orange-400 w-12" : "bg-gray-600 w-10"
                      }`}
                    />
                    <div className="h-1 bg-gray-700 rounded w-8 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Main content - Keywords table */}
            <div className="flex-1 bg-[#1C1C1E] rounded-lg p-3 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-xs font-semibold">
                  Keywords
                </span>
                <div className="flex gap-1.5">
                  <div className="bg-purple-600 text-white text-[8px] px-2 py-0.5 rounded">
                    Add Keywords +
                  </div>
                  <div className="bg-orange-600 text-white text-[8px] px-2 py-0.5 rounded">
                    Found 287 Suggestions
                  </div>
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-6 gap-1 text-[8px] text-gray-400 mb-1.5 px-1">
                <span>Keyword</span>
                <span>Last update</span>
                <span>Popularity</span>
                <span>Difficulty</span>
                <span>Position</span>
                <span>Apps</span>
              </div>

              {/* Table rows */}
              {[
                { kw: "curriculum vitae", pos: 20 },
                { kw: "cv template", pos: 15 },
                { kw: "resume ai", pos: 22 },
                { kw: "resume template", pos: 25 },
                { kw: "resume now", pos: 25 },
                { kw: "ai resume builder", pos: 6 },
              ].map((row, i) => (
                <div
                  key={row.kw}
                  className="grid grid-cols-6 gap-1 text-[8px] text-white bg-[#111213] rounded p-1.5 mb-0.5 items-center"
                >
                  <span className="text-gray-300 truncate">{row.kw}</span>
                  <span className="text-gray-500">A few sec...</span>
                  <div className="bg-green-500/20 rounded-full h-1.5 w-10">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${50 + i * 8}%` }}
                    />
                  </div>
                  <div className="bg-red-500/20 rounded-full h-1.5 w-10">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${30 + i * 5}%` }}
                    />
                  </div>
                  <span className="text-orange-400 font-bold">
                    {row.pos}{" "}
                    <span className="text-green-400 text-[6px]">
                      ↑{Math.floor(Math.random() * 5) + 1}
                    </span>
                  </span>
                  <div className="flex -space-x-0.5">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded border border-[#1C1C1E]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Mac stand */}
    <div className="mx-auto w-20 h-3 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] rounded-b" />
    <div className="mx-auto w-28 h-1 bg-[#2a2a2a] rounded-b-full" />
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

  // SVG Icons for highlights
  const TargetIcon = () => (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
  const ChartIcon = () => (
    <svg
      className="w-6 h-6 text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
  const GlobeIcon = () => (
    <svg
      className="w-6 h-6 text-green-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
  const SparklesIcon = () => (
    <svg
      className="w-6 h-6 text-purple-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
  const LightbulbIcon = () => (
    <svg
      className="w-6 h-6 text-yellow-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
  const StarIcon = () => (
    <svg
      className="w-6 h-6 text-pink-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  // Feature highlights for the research section
  const highlights = [
    {
      icon: <TargetIcon />,
      title: "Only the most accurate data",
      desc: "BetterApp extracts keyword data from App Store search results and calculates how challenging it is to rank among the top apps.",
    },
    {
      icon: <ChartIcon />,
      title: "Keep everything under control",
      desc: "BetterApp daily updates keyword rankings, tracks position changes, and provides historical performance graphs for easy monitoring.",
    },
    {
      icon: <GlobeIcon />,
      title: "All the stores you need",
      desc: "BetterApp allows you to track keywords across multiple App Store regions where your app is available!",
    },
    {
      icon: <SparklesIcon />,
      title: "AI-Powered Analysis",
      desc: "Get intelligent insights about your competitors with AI that analyzes reviews, identifies weaknesses, and suggests improvements.",
    },
    {
      icon: <LightbulbIcon />,
      title: "It suggests keywords for you",
      desc: "BetterApp already knows which keywords your app is ranking for and also allows you to find out those of your competitors.",
    },
    {
      icon: <StarIcon />,
      title: "Total control over reviews",
      desc: "BetterApp analyzes reviews worldwide to discover what users love and hate, helping you build better features.",
    },
  ];

  return (
    <>
      {/* Section 1: Everything you need to grow your app */}
      <section
        className={`w-full py-20 md:py-28 ${
          isDark ? "bg-[#111213]" : "bg-gray-50"
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
              to grow your app
            </motion.h2>
            <motion.p
              className={`text-lg max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1: Stop Guessing - With iPhone mockup */}
            <motion.div
              className={`group rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 ${
                isDark
                  ? "bg-[#1C1C1E] border border-gray-800 hover:border-gray-700"
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
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  BetterApp tells you exactly which keywords your customers are
                  using; all you have to do is include them in your metadata.
                </p>
              </div>
              <div className="flex justify-center items-center flex-1 py-4">
                <IPhoneMockup alt="BetterApp mobile interface" />
              </div>
            </motion.div>

            {/* Middle Column: Results + Save hours */}
            <div className="flex flex-col gap-6 md:gap-8">
              {/* Feature 2: Results */}
              <motion.div
                className={`group rounded-2xl p-6 md:p-8 flex flex-col flex-1 transition-all duration-300 ${
                  isDark
                    ? "bg-[#1C1C1E] border border-gray-800 hover:border-gray-700"
                    : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
                }`}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-4">
                  <h3
                    className={`text-xl md:text-2xl font-bold mb-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Results that make a difference
                  </h3>
                  <p
                    className={`text-sm md:text-base leading-relaxed ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    90% of BetterApp users experience an increase in app
                    impressions within the first week after updating their
                    metadata.
                  </p>
                </div>
                <div className="flex-grow flex items-center justify-center">
                  <div className="w-full h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-3xl md:text-4xl font-bold text-orange-400">
                    +35%
                  </span>
                </div>
              </motion.div>

              {/* Feature: Save hours + Keywords */}
              <motion.div
                className={`group rounded-2xl p-6 md:p-8 flex flex-col flex-1 transition-all duration-300 ${
                  isDark
                    ? "bg-[#1C1C1E] border border-gray-800 hover:border-gray-700"
                    : "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
                }`}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3
                  className={`text-xl md:text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Save hours of work
                </h3>
                <p
                  className={`text-sm md:text-base leading-relaxed mb-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  You don't have to search for which keywords your app is
                  ranking for. BetterApp already knows.
                </p>
                {/* Keyword tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {[
                    "Speak",
                    "Practice",
                    "Pronunciation",
                    "Accent",
                    "Voice",
                    "Learn English",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        isDark
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Feature 3: Unlimited - With Mac mockup */}
            <motion.div
              className={`group rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 ${
                isDark
                  ? "bg-[#1C1C1E] border border-gray-800 hover:border-gray-700"
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
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  BetterApp has a fixed annual subscription: if you need to
                  track thousands of keywords, you can do so without paying
                  anything extra.
                </p>
              </div>
              <div className="flex justify-center items-center flex-1 py-4">
                <MacMockup alt="BetterApp desktop dashboard" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: The pleasure of research - Like Astro */}
      <section
        className={`w-full py-20 md:py-28 ${
          isDark ? "bg-[#111213]" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              The pleasure of research
            </motion.h2>
            <motion.p
              className={`text-lg max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Thanks to its minimal interface, you have all the truly important
              information in a single view that allows you to quickly understand
              how your app is performing.
            </motion.p>
          </div>

          {/* Large Dashboard Screenshot */}
          <motion.div
            className="mb-16 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Mac Frame for full dashboard */}
            <div
              className="bg-[#2a2a2a] rounded-xl overflow-hidden mx-auto"
              style={{ boxShadow: "0 25px 80px -20px rgba(0, 0, 0, 0.6)" }}
            >
              {/* Title bar */}
              <div className="bg-[#3a3a3a] px-4 py-2.5 flex items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-gray-400 text-xs font-medium">
                    BetterApp — ASO Dashboard
                  </span>
                </div>
              </div>

              {/* Dashboard Screenshot */}
              <div className="bg-[#111213]">
                <img
                  src="/screenshot.landing.png"
                  alt="BetterApp ASO Dashboard - Track keywords, analyze competitors, and optimize your App Store presence"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h4
                    className={`font-semibold mb-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesShowcase;
