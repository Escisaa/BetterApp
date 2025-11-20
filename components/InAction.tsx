import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ChartBarIcon,
  ClockIcon,
  GiftIcon,
  SearchIcon,
  StarIcon,
  DownloadIcon,
  RevenueIcon,
  WandIcon,
  CheckCircleIcon,
} from "./Icons";

// Mock data based on the screenshot for a static demonstration
const mockApps = [
  {
    name: "Cal.ai: AI Calendar Assistant",
    developer: "Dexter Labs Inc.",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/a7/67/63/a7676356-94cd-12a8-1915-a7b629e84610/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.9,
    reviews: "1.2K ratings",
  },
  {
    name: "Sober Sidekick: Quit Addiction",
    developer: "Chris Thompson",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/1e/e5/22/1ee52263-241f-a579-28be-24f488421a57/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.8,
    reviews: "6.6K ratings",
  },
  {
    name: "Relay: Quit Porn Addiction",
    developer: "Relay Health Inc",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/5a/9e/c8/5a9ec851-f23c-9a02-0c91-23d2459b81e7/AppIcon-1x_U007e-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.7,
    reviews: "681 ratings",
  },
  {
    name: "Rise: Life reset in 66 days",
    developer: "Ka Wai Tong",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/c7/b8/18/c7b81832-601d-55e1-512a-3051410f13e7/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.7,
    reviews: "5.4K ratings",
  },
  {
    name: "Sobriety Tracker Day Counter",
    developer: "Whistle Studios LLC",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/e5/03/52/e50352ba-3141-861c-7f55-1f1976774681/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.2,
    reviews: "85 ratings",
  },
  {
    name: "Structured - Day Planner",
    developer: "Structured GmbH",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/21/53/b4/2153b473-1563-952b-a010-48af65633b49/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.8,
    reviews: "115k ratings",
  },
  {
    name: "Habit Tracker - Habit Rewards",
    developer: "BetterBit",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/c6/8c/78/c68c78d0-088f-44a3-718f-7634d0b16f39/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/100x100bb.jpg",
    rating: 4.7,
    reviews: "109 ratings",
  },
];

const InAction = () => {
  // Icons specific to this demonstration component
  const MessageBubbleIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.28c-.44.033-.855.197-1.192.45l-3.324 2.348a.75.75 0 01-1.034-.635v-4.48c0-.434-.224-.84-.598-1.08l-3.324-2.348a.75.75 0 010-1.27l3.324-2.348c.374-.24.598-.646.598-1.08v-4.48a.75.75 0 011.034-.635l3.324 2.348c.337.253.752.417 1.192.45l3.722.28c1.133.093 1.98.957 1.98 2.097z"
      />
    </svg>
  );

  const USFlagIcon = () => (
    <svg
      className="w-5 h-5 rounded-sm"
      viewBox="0 0 72 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#B22234" d="m0 0h72v48H0z" />
      <path
        fill="#fff"
        d="m0 4h72v4H0zm0 8h72v4H0zm0 8h72v4H0zm0 8h72v4H0zm0 8h72v4H0zm0 8h72v4H0z"
      />
      <path fill="#3C3B6E" d="m0 0h36v28H0z" />
      <path
        fill="#fff"
        d="m3.3 2.8 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm-26.1 7 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm-22.3 7 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm-26.1 7 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1zm7.4 0 1.1 3.4-3-2.1h3.7l-3 2.1z"
      />
    </svg>
  );

  const mainApp = mockApps[0];
  const tags = [
    "AI Assistant",
    "Calendar",
    "Productivity",
    "scheduling",
    "time management",
    "smart calendar",
    "meeting booking",
  ];
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
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">
          See <span className="text-orange-500">AppScope</span> in action
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-400">
          Explore the interface and discover how easy it is to analyze
          competitors and understand the market.
        </p>
      </motion.div>
      <motion.div
        className="max-w-7xl mx-auto mt-12 bg-[#1C1C1E]/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl p-2.5 relative"
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
        {/* macOS-style traffic lights */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <div className="w-3 h-3 bg-[#ff5f57] rounded-full"></div>
          <div className="w-3 h-3 bg-[#febc2e] rounded-full"></div>
          <div className="w-3 h-3 bg-[#28c840] rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row bg-[#1C1C1E] rounded-xl overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-full md:w-80 border-r border-gray-800 bg-black/20 flex-shrink-0">
            <div className="p-3 border-b border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                <span>App Store</span>
                <button className="flex items-center space-x-1.5 px-2 py-1 bg-gray-800 rounded-md">
                  <USFlagIcon />
                  <span>United States</span>
                  <span>▾</span>
                </button>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  defaultValue="cal.ai"
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <ul className="p-2 space-y-1">
              {mockApps.map((app, index) => (
                <li
                  key={index}
                  className={`flex items-start space-x-3 p-2 rounded-lg cursor-pointer ${
                    index === 0 ? "bg-gray-800" : "hover:bg-gray-700/50"
                  }`}
                >
                  <img
                    src={app.icon}
                    alt={`${app.name} icon`}
                    className="w-10 h-10 rounded-lg flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm text-gray-100 truncate">
                      {app.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {app.developer}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <StarIcon className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-gray-300 font-medium">
                        {app.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({app.reviews})
                      </span>
                    </div>
                  </div>
                  <MessageBubbleIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#1C1C1E]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800">
                  <ChartBarIcon className="w-5 h-5 text-blue-400" /> Tracked
                  Apps
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800">
                  <ClockIcon className="w-5 h-5 text-gray-500" /> Analysis
                  History
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800">
                  <GiftIcon className="w-5 h-5 text-orange-400" /> Feature
                  Requests
                </button>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-200 text-gray-900">
                <CheckCircleIcon className="w-5 h-5" /> Premium
              </button>
            </div>

            <div className="mt-6 space-y-8 text-gray-100">
              {/* App Header */}
              <div className="flex items-start space-x-5">
                <img
                  src={mainApp.icon}
                  alt={`${mainApp.name} icon`}
                  className="w-20 h-20 rounded-2xl"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{mainApp.name}</h1>
                    <a
                      href="#"
                      className="text-xs font-semibold text-blue-400 bg-blue-900/50 px-2 py-1 rounded"
                    >
                      App Store
                    </a>
                  </div>
                  <p className="text-md text-gray-400 mt-1">
                    {mainApp.developer}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-bold text-lg">
                      {mainApp.rating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(mainApp.rating)
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {mainApp.reviews}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Released 23 Jul 2024
                  </p>
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <h2 className="text-base font-semibold mb-3">Screenshots</h2>
                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-6 px-6">
                  {[
                    "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource126/v4/96/6e/8f/966e8fa3-80b0-8b17-7204-6202b80a4c07/e25e9d99-873b-4176-946f-859a117f735d_iPhone_15_Pro_Max__-1.jpg/300x0w.webp",
                    "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource116/v4/55/e8/3b/55e83b87-d51d-8472-a0b8-c3e06a3822f7/09f1d07c-9b78-4389-a2a4-5690558b29f0_iPhone_15_Pro_Max__-2.jpg/300x0w.webp",
                    "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource116/v4/7c/49/a0/7c49a031-29a3-5c3a-9e79-880436d5b00c/93121e42-1e35-42cf-9c16-2c9749c95d98_iPhone_15_Pro_Max__-3.jpg/300x0w.webp",
                    "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource116/v4/9a/57/9a/9a579a32-15f1-432a-57b1-2ba755c3c0f4/1511a2f6-302a-4ce4-be8c-d6b7e8d6f514_iPhone_15_Pro_Max__-4.jpg/300x0w.webp",
                    "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource126/v4/d4/dd/50/d4dd5052-a5f1-4835-502a-2895780a2cd9/c4c6a655-bdc7-4340-a15e-a6a57c5a0134_iPhone_15_Pro_Max__-5.jpg/300x0w.webp",
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Screenshot ${i + 1}`}
                      className="h-72 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* App Performance */}
              <div>
                <h2 className="text-base font-semibold mb-3">
                  App Performance
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-900/50">
                      <DownloadIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mt-3">
                      Downloads
                    </p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                    <p className="text-3xl font-bold text-gray-100 mt-1">
                      100k
                    </p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-900/50">
                      <RevenueIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mt-3">
                      Revenue
                    </p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                    <p className="text-3xl font-bold text-gray-100 mt-1">
                      $300k
                    </p>
                  </div>
                </div>
              </div>

              {/* Relevant AI Tags */}
              <div>
                <h2 className="text-base font-semibold mb-3">
                  Relevant AI Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-orange-900/50 text-orange-400 text-xs font-medium px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="flex items-center justify-between border-t border-gray-800 pt-6">
                <h2 className="text-lg font-semibold">
                  Reviews (221){" "}
                  <span className="text-sm text-gray-500 font-normal">ⓘ</span>
                </h2>
                <button className="flex items-center space-x-2 bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-orange-700 transition-colors shadow-md shadow-orange-900/20">
                  <WandIcon className="w-5 h-5" />
                  <span>Analyze reviews with AI</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    </motion.section>
  );
};
export default InAction;
