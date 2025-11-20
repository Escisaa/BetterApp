import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fetchAppIcon } from "../services/apiService";

// App names to search for - these will be fetched from the App Store
const appNamesRow1 = [
  "bolt",
  "Airbnb",
  "Notion",
  "Spotify",
  "TikTok",
  "quittr",
  "payout",
  "Headspace",
  "Pinterest",
  "Shazam",
  "cal.ai",
  "Uber",
];

const appNamesRow2 = [
  "Slack",
  "Tinder",
  "Hinge",
  "Revolut",
  "Figma",
  "Threads",
  "Calm",
  "Fastic",
  "Bumble",
  "Strava",
  "VSCO",
  "Letterboxd",
];

interface AppIcon {
  name: string;
  icon: string;
}

const MobileMockupSection: React.FC = () => {
  const [appsRow1, setAppsRow1] = useState<AppIcon[]>([]);
  const [appsRow2, setAppsRow2] = useState<AppIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const fetchAppIcons = async () => {
      setIsLoading(true);

      // Fetch all apps in parallel - no delays, maximum speed
      const allAppNames = [...appNamesRow1, ...appNamesRow2];
      const allPromises = allAppNames.map(async (appName) => {
        try {
          const appData = await fetchAppIcon(appName);
          return {
            name: appData.name,
            icon: appData.icon,
          };
        } catch (error) {
          console.error(`Failed to fetch icon for ${appName}:`, error);
          return {
            name: appName,
            icon: "",
          };
        }
      });

      // Wait for all requests to complete in parallel
      const allApps = await Promise.all(allPromises);

      // Split back into rows
      const row1Apps = allApps.slice(0, appNamesRow1.length);
      const row2Apps = allApps.slice(appNamesRow1.length);

      // Preload images row by row to fix Safari slow loading
      // Set row 1 immediately after its images load
      const row1Icons = row1Apps
        .map((app) => app.icon)
        .filter((icon) => icon && icon.length > 0);
      const row1ImagePromises = row1Icons.map((iconUrl) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = iconUrl;
          setTimeout(() => resolve(), 1500); // Shorter timeout for row 1
        });
      });

      // Show row 1 as soon as its images load
      await Promise.all(row1ImagePromises);
      setAppsRow1(row1Apps);

      // Preload row 2 images in parallel
      const row2Icons = row2Apps
        .map((app) => app.icon)
        .filter((icon) => icon && icon.length > 0);
      const row2ImagePromises = row2Icons.map((iconUrl) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = iconUrl;
          setTimeout(() => resolve(), 1500);
        });
      });

      // Show row 2 after its images load
      await Promise.all(row2ImagePromises);
      setAppsRow2(row2Apps);
      setIsLoading(false);
    };

    fetchAppIcons();
  }, []);

  const renderAppIcon = (
    app: AppIcon,
    idx: number,
    row: number,
    uniqueKey: string
  ) => {
    return (
      <div
        key={uniqueKey}
        className="flex-shrink-0 h-16 w-16 min-w-[64px] bg-gray-900/50 rounded-2xl border border-gray-800 p-1.5 flex items-center justify-center hover:border-gray-700 transition-colors"
      >
        {app.icon ? (
          <img
            src={app.icon}
            alt={app.name}
            className="w-full h-full object-cover rounded-xl"
            loading="eager"
            decoding="async"
            onError={(e) => {
              // Fallback if image fails to load
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              const parent = img.parentElement;
              if (parent && !parent.querySelector(".fallback-text")) {
                const fallback = document.createElement("div");
                fallback.className =
                  "w-full h-full bg-gray-800 rounded-xl flex items-center justify-center text-[10px] text-gray-500 text-center px-1 fallback-text";
                fallback.textContent = app.name;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center text-[10px] text-gray-500 text-center px-1">
            {app.name}
          </div>
        )}
      </div>
    );
  };

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
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Analyze top apps, from indie hits to industry leaders
        </h2>
        <p className="max-w-2xl mx-auto mt-3 text-base text-gray-500">
          We provide insights for millions of apps on the App Store.
        </p>
      </motion.div>

      <div className="mt-12 space-y-6 max-w-7xl mx-auto">
        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: "80px" }}
        >
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#111213] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#111213] to-transparent z-10 pointer-events-none" />
          <div
            className="scroll-left flex items-center gap-6"
            style={{
              display: "flex",
              width: "max-content",
              willChange: "transform",
            }}
          >
            {isLoading
              ? // Show loading placeholders
                [...Array(12)].map((_, idx) => (
                  <div
                    key={`loading-1-${idx}`}
                    className="flex-shrink-0 h-16 w-16 bg-gray-900/50 rounded-2xl border border-gray-800 p-1.5 flex items-center justify-center"
                  >
                    <div className="w-full h-full bg-gray-800 rounded-xl animate-pulse"></div>
                  </div>
                ))
              : [...appsRow1, ...appsRow1, ...appsRow1, ...appsRow1].map(
                  (app, idx) =>
                    renderAppIcon(app, idx % appsRow1.length, 1, `row1-${idx}`)
                )}
          </div>
        </div>

        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: "80px" }}
        >
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#111213] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#111213] to-transparent z-10 pointer-events-none" />
          <div
            className="scroll-right flex items-center gap-6"
            style={{
              display: "flex",
              width: "max-content",
              willChange: "transform",
            }}
          >
            {isLoading
              ? // Show loading placeholders
                [...Array(12)].map((_, idx) => (
                  <div
                    key={`loading-2-${idx}`}
                    className="flex-shrink-0 h-16 w-16 bg-gray-900/50 rounded-2xl border border-gray-800 p-1.5 flex items-center justify-center"
                  >
                    <div className="w-full h-full bg-gray-800 rounded-xl animate-pulse"></div>
                  </div>
                ))
              : [...appsRow2, ...appsRow2, ...appsRow2, ...appsRow2].map(
                  (app, idx) =>
                    renderAppIcon(app, idx % appsRow2.length, 2, `row2-${idx}`)
                )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// FIX: Add missing default export. This resolves the import error in `LandingPage.tsx`.
// This complete file also replaces the truncated version which contained the type error.
export default MobileMockupSection;
