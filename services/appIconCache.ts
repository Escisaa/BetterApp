// Pre-cached app icons for instant display on landing page
// These are common apps that users will see immediately

export const PRECACHED_APP_ICONS: Record<string, string> = {
  // Row 1 - Real iTunes icon URLs (instant display)
  bolt: "",
  Airbnb:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/80/ca/9e/80ca9e9f-635d-2e19-4dae-f6c557c09018/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
  Notion:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/42/84/8f/42848f79-a14c-6c35-431c-ba0a5548b780/AppIconProd-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
  Spotify:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/a2/ee/50/a2ee50e0-e6b6-b966-b461-04a501f44c8f/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/512x512bb.jpg",
  TikTok:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c6/35/45/c6354534-2fa9-071b-801c-d9d03c256d23/AppIcon_TikTok-0-0-1x_U007epad-0-1-0-0-85-220.png/512x512bb.jpg",
  quittr: "",
  payout: "",
  Headspace:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/dd/7d/90/dd7d9006-64e8-b83c-4f32-95b9a8fac551/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
  Pinterest:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/49/07/9c/49079c9b-bcaa-121b-0205-7b36078b4205/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/512x512bb.jpg",
  Shazam:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/45/56/da/4556daa0-5932-35c9-7036-e10550174944/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
  "cal.ai": "",
  Uber: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/70/bb/92/70bb926a-4124-2795-cf7c-375c126dc682/AppIcon-0-0-1x_U007emarketing-0-8-0-0-85-220.png/512x512bb.jpg",

  // Row 2 - Real iTunes icon URLs (instant display)
  Slack:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/03/0f/61/030f61e2-a700-85a4-bf7a-23dabada38ea/slack_icon_prod-0-0-1x_U007epad-0-1-sRGB-85-220.png/512x512bb.jpg",
  Tinder:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/e7/c2/2f/e7c22f2b-df21-5d96-6e6f-a65d02beb71d/AppIcon-0-0-1x_U007emarketing-0-8-0-0-sRGB-0-85-220.png/512x512bb.jpg",
  Hinge:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0b/ff/c0/0bffc00d-a75e-6cbd-7fdc-53f2dbda04ed/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg",
  Revolut:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/af/61/7e/af617ea4-a89d-1f99-3a74-184bfdd8b66b/AppIcon-Production-0-1x_U007epad-0-1-85-220-0.png/512x512bb.jpg",
  Figma:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2c/e2/88/2ce28876-c21b-0e0d-fe5c-64d6522f8ca9/AppIcon-0-1x_U007epad-0-1-0-85-220-0.png/512x512bb.jpg",
  Threads:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/35/9d/5c/359d5ca4-0bf4-8fae-c0e7-b941a5aa564c/Prod-0-0-1x_U007ephone-0-0-0-1-0-0-85-220.png/512x512bb.jpg",
  Calm: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0c/cf/ad/0ccfad45-f506-5d24-90d7-10fa8995218e/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
  Fastic: "",
  Bumble:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b4/0b/22/b40b2252-e49f-9c43-693a-6ce7cac44c46/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.png/512x512bb.jpg",
  Strava:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c8/49/f3/c849f3ee-3855-ba81-60c8-523bb7152fa4/AppIcon-0-0-1x_U007ephone-0-1-0-sRGB-85-220.png/512x512bb.jpg",
  VSCO: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/f2/44/1c/f2441cf9-b635-25a4-d22b-848961806393/app-icon-production-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
  Letterboxd: "",
};

// Cache key for localStorage
const CACHE_KEY = "betterapp_icon_cache";
const CACHE_EXPIRY_DAYS = 30;

interface CachedIcon {
  icon: string;
  timestamp: number;
}

/**
 * Get cached icon from localStorage
 */
export const getCachedIcon = (appName: string): string | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cache: Record<string, CachedIcon> = JSON.parse(cached);
    const entry = cache[appName.toLowerCase()];

    if (!entry) return null;

    // Check if cache is expired
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - entry.timestamp > expiryTime) {
      return null;
    }

    return entry.icon || null;
  } catch (error) {
    return null;
  }
};

/**
 * Save icon to cache
 */
export const setCachedIcon = (appName: string, icon: string): void => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cache: Record<string, CachedIcon> = cached ? JSON.parse(cached) : {};

    cache[appName.toLowerCase()] = {
      icon,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
};

/**
 * Get icon from pre-cache or localStorage cache, or return empty string
 */
export const getInstantIcon = (appName: string): string => {
  // 1. Check pre-cached icons first (instant)
  const precached = PRECACHED_APP_ICONS[appName];
  if (precached) return precached;

  // 2. Check localStorage cache
  const cached = getCachedIcon(appName);
  if (cached) return cached;

  // 3. Return empty (will be fetched)
  return "";
};
