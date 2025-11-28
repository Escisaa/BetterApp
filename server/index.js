import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  validateLicense,
  getLicenseInfo,
  activateLicense,
  getSupabaseClient,
} from "./services/licenseService.js";
import { handleStripeWebhook } from "./services/stripeService.js";
import { createCheckoutSession } from "./services/stripeCheckout.js";
import { createCustomerPortalSession } from "./services/stripeCustomerPortal.js";
import {
  analyzeReviewsWithAI,
  generateTagsWithAI,
  chatWithAI,
  analyzeCompetitiveIntelligence,
} from "./services/geminiService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Trust proxy (required for Render and rate limiting to work correctly)
app.set("trust proxy", true);

// Middleware
app.use(cors());

// Stripe webhook MUST be before express.json() to receive raw body for signature verification
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).json({ error: "Webhook secret not configured" });
    }

    try {
      // Verify webhook signature
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      const result = await handleStripeWebhook(event);

      if (result.success) {
        res.json({ received: true });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Now apply JSON parsing for all other routes
app.use(express.json());

/**
 * Track user email (optional signup for analytics)
 * POST /api/users/track
 * Body: { email: string }
 */
app.post("/api/users/track", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    const supabase = getSupabaseClient();

    // Insert or update user email (upsert)
    const { error } = await supabase.from("users").upsert(
      {
        email: email.trim().toLowerCase(),
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      }
    );

    if (error) {
      console.error("Error tracking user email:", error);
      // Don't fail - this is optional tracking
      return res.json({ success: true, message: "Email tracked" });
    }

    res.json({ success: true, message: "Email tracked" });
  } catch (error) {
    console.error("Error in user tracking:", error);
    // Don't fail - this is optional
    res.json({ success: true, message: "Email tracked" });
  }
});

// Rate limiting to prevent abuse - Production-ready limits
// Icon fetches are non-critical, so they get very lenient limits
const iconLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Very lenient for icon fetches (non-critical)
  message: "Too many requests. Please wait a moment and try again.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  validate: {
    trustProxy: false, // Disable validation warning - we trust Render's proxy
  },
});

// General API routes (search, etc.) - increased for production
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased significantly for production (was 200)
  message: "Too many requests. Please wait a moment and try again.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable validation warning - we trust Render's proxy
  },
});

// Strict limiter for premium/AI features
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased for production (was 50)
  message: "Too many requests. Please wait a moment and try again.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable validation warning - we trust Render's proxy
  },
});

// Email limiter - keep strict to prevent spam
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 email sends per hour
  message: "Too many email requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable validation warning - we trust Render's proxy
  },
});

// Apply general rate limiting to all API routes (except icon which has its own limiter)
app.use("/api/", (req, res, next) => {
  // Skip rate limiting for icon fetches (they have their own lenient limiter)
  if (req.path === "/icon" || req.path.startsWith("/icon")) {
    return next();
  }
  return generalLimiter(req, res, next);
});

// API-only backend - frontend is served by Vercel
// Return 404 for non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next(); // Let API routes through
  }
  // All other routes return 404 (frontend is on Vercel)
  res.status(404).json({ error: "Not found. Frontend is served by Vercel." });
});

// Environment variables
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// Helper to format large numbers
const formatCount = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}m`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
};

/**
 * Search for apps using iTunes API
 * GET /api/search?q=searchTerm
 */
app.get("/api/search", async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const country = req.query.country || "US";
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      searchTerm
    )}&entity=software&country=${country}&limit=25`;

    const response = await axios.get(url, {
      timeout: 10000,
    });

    if (!response.data.results) {
      return res.json({ results: [] });
    }

    const apps = response.data.results.map((item) => ({
      id: item.trackId.toString(),
      name: item.trackName,
      developer: item.artistName,
      icon:
        item.artworkUrl100?.replace("100x100", "256x256") || item.artworkUrl100,
      rating: parseFloat(item.averageUserRating) || 0,
      reviewsCount: formatCount(item.userRatingCount || 0),
      releaseDate: new Date(item.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      screenshots: [],
      downloads: "N/A",
      revenue: "N/A",
      reviews: [],
    }));

    res.json({ results: apps });
  } catch (error) {
    console.error("Error searching apps:", error.message);
    res.status(500).json({
      error: "Failed to search apps",
      message: error.message,
    });
  }
});

/**
 * Get detailed app information
 * GET /api/app/:id
 */
app.get("/api/app/:id", async (req, res) => {
  try {
    const appId = req.params.id;

    // Fetch app metadata
    const lookupUrl = `https://itunes.apple.com/lookup?id=${appId}&entity=software&country=US`;
    const lookupResponse = await axios.get(lookupUrl, { timeout: 10000 });

    if (
      !lookupResponse.data.results ||
      lookupResponse.data.results.length === 0
    ) {
      return res.status(404).json({ error: "App not found" });
    }

    const appData = lookupResponse.data.results[0];

    // Fetch reviews
    let reviews = [];
    try {
      const reviewsUrl = `https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`;
      const reviewsResponse = await axios.get(reviewsUrl, { timeout: 10000 });

      if (reviewsResponse.data.feed && reviewsResponse.data.feed.entry) {
        reviews = reviewsResponse.data.feed.entry
          .slice(1)
          .map((entry, index) => ({
            id: index,
            rating: parseInt(entry["im:rating"].label, 10),
            author: entry.author.name.label,
            date: new Date(entry.updated.label).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            title: entry.title.label,
            content: entry.content.label,
          }));
      }
    } catch (reviewError) {
      console.warn("Could not fetch reviews:", reviewError.message);
      // Continue without reviews
    }

    // Format file size
    const formatFileSize = (bytes) => {
      if (!bytes) return "N/A";
      const mb = bytes / (1024 * 1024);
      if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${mb.toFixed(1)} MB`;
    };

    const app = {
      id: appData.trackId.toString(),
      name: appData.trackName,
      developer: appData.artistName,
      icon:
        appData.artworkUrl100?.replace("100x100", "256x256") ||
        appData.artworkUrl100,
      rating: parseFloat(appData.averageUserRating) || 0,
      reviewsCount: formatCount(appData.userRatingCount || 0),
      releaseDate: new Date(appData.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      screenshots: (() => {
        // iTunes API can return screenshots in different fields
        // Try screenshotUrls first (iPhone), then iPad screenshots
        const screenshots = appData.screenshotUrls || [];
        const ipadScreenshots = appData.ipadScreenshotUrls || [];
        // Combine and deduplicate
        const allScreenshots = [...screenshots, ...ipadScreenshots];
        return [...new Set(allScreenshots)]; // Remove duplicates
      })(),
      downloads: "N/A",
      revenue: "N/A",
      reviews: reviews,
      // Additional iTunes fields
      description: appData.description || "",
      price: appData.price || 0,
      formattedPrice:
        appData.formattedPrice ||
        (appData.price === 0 ? "Free" : `$${appData.price}`),
      contentAdvisoryRating: appData.contentAdvisoryRating || "N/A",
      fileSizeBytes: appData.fileSizeBytes || 0,
      fileSizeFormatted: formatFileSize(appData.fileSizeBytes),
      languageCodes: appData.languageCodesISO2A || [],
      primaryGenreName: appData.primaryGenreName || "",
      genres: appData.genres || [],
      minimumOsVersion: appData.minimumOsVersion || "",
      releaseNotes: appData.releaseNotes || "",
      version: appData.version || "",
      sellerUrl: appData.sellerUrl || "",
      trackViewUrl: appData.trackViewUrl || "",
    };

    res.json(app);
  } catch (error) {
    console.error("Error fetching app details:", error.message);
    res.status(500).json({
      error: "Failed to fetch app details",
      message: error.message,
    });
  }
});

/**
 * Get app icon using SerpAPI
 * GET /api/icon?name=appName
 */
app.get("/api/icon", iconLimiter, async (req, res) => {
  try {
    const appName = req.query.name;
    if (!appName) {
      return res.status(400).json({ error: "App name is required" });
    }

    // Try iTunes API first (primary, free, reliable)
    let iconUrl = null;
    let appTitle = appName;

    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        appName
      )}&entity=software&country=US&limit=1`;
      const itunesResponse = await axios.get(itunesUrl, { timeout: 3000 });

      if (
        itunesResponse.data.results &&
        itunesResponse.data.results.length > 0
      ) {
        const item = itunesResponse.data.results[0];
        iconUrl =
          item.artworkUrl100?.replace("100x100", "512x512") ||
          item.artworkUrl512 ||
          item.artworkUrl100;
        appTitle = item.trackName || appName;

        if (iconUrl) {
          return res.json({ name: appTitle, icon: iconUrl });
        }
      }
    } catch (itunesError) {
      console.warn(
        "iTunes API failed, trying SerpAPI backup:",
        itunesError.message
      );
    }

    // Fallback to SerpAPI only if iTunes fails (backup only)
    if (SERPAPI_API_KEY && !iconUrl) {
      try {
        const serpUrl = "https://serpapi.com/search.json";
        const params = new URLSearchParams({
          engine: "apple_app_store",
          term: appName,
          api_key: SERPAPI_API_KEY,
        });

        const serpResponse = await axios.get(
          `${serpUrl}?${params.toString()}`,
          {
            timeout: 3000,
          }
        );

        const data = serpResponse.data;

        // Check multiple possible response structures
        if (data.apps && Array.isArray(data.apps) && data.apps.length > 0) {
          const firstResult = data.apps[0];
          iconUrl =
            firstResult.thumbnail ||
            firstResult.icon ||
            firstResult.logo ||
            firstResult.image;
          appTitle = firstResult.title || firstResult.name || appName;
        } else if (
          data.organic_results &&
          Array.isArray(data.organic_results) &&
          data.organic_results.length > 0
        ) {
          const firstResult = data.organic_results[0];
          iconUrl =
            firstResult.thumbnail ||
            firstResult.icon ||
            firstResult.logo ||
            firstResult.image;
          appTitle = firstResult.title || firstResult.name || appName;
        } else if (
          data.app_store_results?.apps &&
          Array.isArray(data.app_store_results.apps) &&
          data.app_store_results.apps.length > 0
        ) {
          const firstResult = data.app_store_results.apps[0];
          iconUrl =
            firstResult.thumbnail ||
            firstResult.icon ||
            firstResult.logo ||
            firstResult.image;
          appTitle = firstResult.title || firstResult.name || appName;
        }

        if (iconUrl) {
          return res.json({ name: appTitle, icon: iconUrl });
        }
      } catch (serpError) {
        console.warn("SerpAPI backup also failed:", serpError.message);
      }
    }

    // Return empty if both fail
    res.json({ name: appName, icon: "" });
  } catch (error) {
    console.error("Error fetching app icon:", error.message);
    res.status(500).json({
      error: "Failed to fetch app icon",
      message: error.message,
    });
  }
});

/**
 * Validate license key
 * POST /api/license/validate
 * Body: { licenseKey: string, deviceId?: string }
 */
app.post("/api/license/validate", strictLimiter, async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ error: "License key is required" });
    }

    const result = await validateLicense(licenseKey, deviceId);

    if (result.valid) {
      res.json({
        valid: true,
        plan: result.plan,
        expiresAt: result.expiresAt,
        message: result.message,
      });
    } else {
      res.status(401).json({
        valid: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error validating license:", error);
    res.status(500).json({
      error: "Failed to validate license",
      message: error.message,
    });
  }
});

/**
 * Get license info
 * GET /api/license/info?licenseKey=xxx
 */
app.get("/api/license/info", async (req, res) => {
  try {
    const { licenseKey } = req.query;

    if (!licenseKey) {
      return res.status(400).json({ error: "License key is required" });
    }

    const info = await getLicenseInfo(licenseKey);

    if (info) {
      res.json(info);
    } else {
      res.status(404).json({ error: "License not found" });
    }
  } catch (error) {
    console.error("Error getting license info:", error);
    res.status(500).json({
      error: "Failed to get license info",
      message: error.message,
    });
  }
});

/**
 * Activate license (link to device)
 * POST /api/license/activate
 * Body: { licenseKey: string, deviceId: string }
 */
app.post("/api/license/activate", async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
      return res
        .status(400)
        .json({ error: "License key and device ID are required" });
    }

    const result = await activateLicense(licenseKey, deviceId);

    if (result.success) {
      res.json({ success: true, license: result.license });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error activating license:", error);
    res.status(500).json({
      error: "Failed to activate license",
      message: error.message,
    });
  }
});

/**
 * Resend license key to email
 * POST /api/license/resend
 * Body: { email: string }
 */
app.post("/api/license/resend", emailLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find subscription by email
    const supabase = getSupabaseClient();
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*, licenses(*)")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No subscription found for this email",
      });
    }

    const subscription = subscriptions[0];

    if (subError || !subscription) {
      return res.status(404).json({
        success: false,
        error: "No subscription found for this email",
      });
    }

    // Get the license key
    const license = subscription.licenses?.[0];
    if (!license) {
      return res.status(404).json({
        success: false,
        error: "No license found for this subscription",
      });
    }

    // Resend license key email
    const { sendLicenseKey } = await import("./services/emailService.js");
    const emailResult = await sendLicenseKey(
      email,
      license.license_key,
      subscription.plan
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: "License key sent to your email",
      });
    } else {
      res.status(500).json({
        success: false,
        error: emailResult.error || "Failed to send email",
      });
    }
  } catch (error) {
    console.error("Error resending license key:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend license key",
      message: error.message,
    });
  }
});

/**
 * Create Stripe checkout session
 * POST /api/stripe/checkout
 */
app.post("/api/stripe/checkout", strictLimiter, async (req, res) => {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return res.status(400).json({ error: "Stripe price ID not configured" });
    }

    const { successUrl, cancelUrl } = req.body;
    const defaultSuccessUrl =
      successUrl ||
      `${req.headers.origin || "http://localhost:5173"}/?success=true`;
    const defaultCancelUrl =
      cancelUrl ||
      `${req.headers.origin || "http://localhost:5173"}/?canceled=true`;

    const result = await createCheckoutSession(
      priceId,
      defaultSuccessUrl,
      defaultCancelUrl
    );

    if (result.success) {
      res.json({ url: result.url, sessionId: result.sessionId });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/**
 * Create Stripe Customer Portal session (for managing subscription)
 * POST /api/stripe/portal
 * Body: { licenseKey: string, returnUrl?: string }
 */
app.post("/api/stripe/portal", strictLimiter, async (req, res) => {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ error: "License key is required" });
    }

    // Get license info to find Stripe customer ID
    const licenseInfo = await getLicenseInfo(licenseKey);
    if (!licenseInfo || !licenseInfo.stripeCustomerId) {
      return res.status(404).json({ error: "License not found or invalid" });
    }

    // Create portal session
    const returnUrl =
      req.body.returnUrl ||
      `${
        req.headers.origin || "https://betterapp-arsv.onrender.com"
      }/dashboard`;
    const result = await createCustomerPortalSession(
      licenseInfo.stripeCustomerId,
      returnUrl
    );

    if (result.success) {
      res.json({ url: result.url });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

// Webhook route moved above - it's now before express.json() middleware

/**
 * AI Analysis endpoint
 * POST /api/ai/analyze
 */
app.post("/api/ai/analyze", strictLimiter, async (req, res) => {
  try {
    const { appName, reviews } = req.body;
    if (!appName || !reviews || !Array.isArray(reviews)) {
      return res
        .status(400)
        .json({ error: "appName and reviews array required" });
    }
    const result = await analyzeReviewsWithAI(appName, reviews);
    res.json(result);
  } catch (error) {
    console.error("Error in analyze endpoint:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to analyze reviews" });
  }
});

/**
 * AI Tags endpoint
 * POST /api/ai/tags
 */
app.post("/api/ai/tags", strictLimiter, async (req, res) => {
  try {
    const { appName, reviews } = req.body;
    if (!appName || !reviews || !Array.isArray(reviews)) {
      return res
        .status(400)
        .json({ error: "appName and reviews array required" });
    }
    const tags = await generateTagsWithAI(appName, reviews);
    res.json({ tags });
  } catch (error) {
    console.error("Error in tags endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to generate tags" });
  }
});

/**
 * AI Chat endpoint
 * POST /api/ai/chat
 */
app.post("/api/ai/chat", strictLimiter, async (req, res) => {
  try {
    const { appName, chatHistory, message } = req.body;
    if (!appName || !message) {
      return res.status(400).json({ error: "appName and message required" });
    }
    const response = await chatWithAI(appName, chatHistory || [], message);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to get chat response" });
  }
});

/**
 * Competitive Intelligence endpoint
 * POST /api/ai/competitive
 */
app.post("/api/ai/competitive", strictLimiter, async (req, res) => {
  try {
    const { appName, reviews, appMetadata } = req.body;
    if (!appName || !reviews || !Array.isArray(reviews)) {
      return res
        .status(400)
        .json({ error: "appName and reviews array required" });
    }
    const result = await analyzeCompetitiveIntelligence(
      appName,
      reviews,
      appMetadata
    );
    res.json(result);
  } catch (error) {
    console.error("Error in competitive intelligence endpoint:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze competitive intelligence",
    });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    serpapi: SERPAPI_API_KEY ? "configured" : "not configured",
    supabase: process.env.SUPABASE_URL ? "configured" : "not configured",
    stripe: process.env.STRIPE_WEBHOOK_SECRET ? "configured" : "not configured",
    gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
    email: process.env.EMAIL_PASSWORD
      ? "configured"
      : "not configured (license emails won't send)",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BetterApp Backend API running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/search?q=term - Search apps`);
  console.log(`   GET /api/app/:id - Get app details`);
  console.log(`   GET /api/icon?name=appName - Get app icon`);
  if (!SERPAPI_API_KEY) {
    console.log(
      `⚠️  SERPAPI_API_KEY not set - icon fetching will use iTunes only`
    );
  }
  if (!process.env.EMAIL_PASSWORD && !process.env.RESEND_API_KEY) {
    console.log(
      `⚠️  EMAIL_PASSWORD or RESEND_API_KEY not set - license emails will NOT be sent!`
    );
    console.log(
      `   Set EMAIL_PASSWORD (Resend API key) in Render environment variables`
    );
  } else {
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom || !emailFrom.includes("@")) {
      console.log(
        `⚠️  EMAIL_FROM not set or invalid - license emails will fail!`
      );
      console.log(
        `   Set EMAIL_FROM to a verified email in Resend (e.g., noreply@yourdomain.com)`
      );
    } else {
      console.log(`✅ Email service configured (Resend API)`);
      console.log(`   From: ${emailFrom}`);
    }
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log(
      `⚠️  STRIPE_WEBHOOK_SECRET not set - Stripe webhooks will fail!`
    );
  }
  if (!process.env.SUPABASE_URL) {
    console.log(
      `❌ SUPABASE_URL not set - subscriptions and licenses will fail!`
    );
  } else if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_ANON_KEY
  ) {
    console.log(
      `❌ SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) not set - subscriptions and licenses will fail!`
    );
    console.log(
      `   💡 Use SUPABASE_SERVICE_ROLE_KEY for server operations (recommended)`
    );
  } else {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log(`✅ Supabase configured with service_role key (recommended)`);
    } else {
      console.log(
        `⚠️  Supabase configured with anon key (consider using service_role key)`
      );
    }
  }
});
