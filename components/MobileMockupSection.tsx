import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fetchAppIcon } from "../services/apiService";
import { getInstantIcon, setCachedIcon } from "../services/appIconCache";

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
  // Initialize with cached icons immediately (no empty arrays!)
  const [appsRow1, setAppsRow1] = useState<AppIcon[]>(() => {
    const apps = appNamesRow1.map((name) => {
      const icon = getInstantIcon(name);
      return { name, icon };
    });
    // Debug: log how many icons we have
    const iconCount = apps.filter((a) => a.icon && a.icon.trim() !== "").length;
    console.log(
      `[MobileMockup] Row 1 initialized: ${iconCount}/${apps.length} icons available`
    );
    return apps;
  });
  const [appsRow2, setAppsRow2] = useState<AppIcon[]>(() => {
    const apps = appNamesRow2.map((name) => {
      const icon = getInstantIcon(name);
      return { name, icon };
    });
    const iconCount = apps.filter((a) => a.icon && a.icon.trim() !== "").length;
    console.log(
      `[MobileMockup] Row 2 initialized: ${iconCount}/${apps.length} icons available`
    );
    return apps;
  });
  const [isLoading, setIsLoading] = useState(false); // Start as false since we have cached icons
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const fetchAppIcons = async () => {
      // Icons are already initialized in useState, so we just update them in background

      // STEP 2: Fetch real icons in background and update progressively
      const BATCH_SIZE = 3; // Smaller batches for background updates

      // Update row 1 in background
      for (let i = 0; i < appNamesRow1.length; i += BATCH_SIZE) {
        const batch = appNamesRow1.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (appName) => {
          try {
            const appData = await fetchAppIcon(appName);
            if (appData.icon) {
              // Cache the icon for next time
              setCachedIcon(appName, appData.icon);
            }
            return {
              name: appData.name,
              icon: appData.icon,
            };
          } catch (error) {
            return {
              name: appName,
              icon: getInstantIcon(appName), // Keep cached version on error
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        // Update only if icon changed (progressive enhancement)
        setAppsRow1((prev) => {
          const updated = [...prev];
          batchResults.forEach((result, idx) => {
            const actualIdx = i + idx;
            if (
              actualIdx < updated.length &&
              result.icon &&
              result.icon !== updated[actualIdx].icon
            ) {
              updated[actualIdx] = result;
            }
          });
          return updated;
        });

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Update row 2 in background
      for (let i = 0; i < appNamesRow2.length; i += BATCH_SIZE) {
        const batch = appNamesRow2.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (appName) => {
          try {
            const appData = await fetchAppIcon(appName);
            if (appData.icon) {
              setCachedIcon(appName, appData.icon);
            }
            return {
              name: appData.name,
              icon: appData.icon,
            };
          } catch (error) {
            return {
              name: appName,
              icon: getInstantIcon(appName),
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        setAppsRow2((prev) => {
          const updated = [...prev];
          batchResults.forEach((result, idx) => {
            const actualIdx = i + idx;
            if (
              actualIdx < updated.length &&
              result.icon &&
              result.icon !== updated[actualIdx].icon
            ) {
              updated[actualIdx] = result;
            }
          });
          return updated;
        });

        await new Promise((resolve) => setTimeout(resolve, 200));
      }
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
        {app.icon && app.icon.trim() !== "" ? (
          <img
            src={app.icon}
            alt={app.name}
            className="w-full h-full object-cover rounded-xl"
            loading={idx < 4 ? "eager" : "lazy"}
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

  // Check if dark mode is active
  const isDark =
    document.documentElement.classList.contains("dark") ||
    !document.documentElement.classList.contains("light");

  return (
    <motion.section
      ref={ref}
      className={`py-20 sm:py-28 px-4 ${isDark ? "bg-[#111213]" : "bg-white"}`}
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
        <h2
          className={`text-xl sm:text-2xl font-semibold tracking-tight ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Trusted by developers analyzing millions of apps
        </h2>
        <p
          className={`max-w-2xl mx-auto mt-2 text-sm ${
            isDark ? "text-gray-500" : "text-gray-600"
          }`}
        >
          From indie startups to Fortune 500 companies
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
              minWidth: "200%", // Ensure enough width for smooth scrolling
            }}
          >
            {appsRow1.length > 0
              ? [...appsRow1, ...appsRow1, ...appsRow1, ...appsRow1].map(
                  (app, idx) =>
                    renderAppIcon(app, idx % appsRow1.length, 1, `row1-${idx}`)
                )
              : // Fallback if empty
                [...Array(12)].map((_, idx) =>
                  renderAppIcon(
                    { name: `App ${idx + 1}`, icon: "" },
                    idx,
                    1,
                    `row1-fallback-${idx}`
                  )
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
              minWidth: "200%", // Ensure enough width for smooth scrolling
            }}
          >
            {appsRow2.length > 0
              ? [...appsRow2, ...appsRow2, ...appsRow2, ...appsRow2].map(
                  (app, idx) =>
                    renderAppIcon(app, idx % appsRow2.length, 2, `row2-${idx}`)
                )
              : // Fallback if empty
                [...Array(12)].map((_, idx) =>
                  renderAppIcon(
                    { name: `App ${idx + 1}`, icon: "" },
                    idx,
                    2,
                    `row2-fallback-${idx}`
                  )
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
