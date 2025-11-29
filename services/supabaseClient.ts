// Supabase Client for Frontend Authentication
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// IMPORTANT: Vite only exposes env vars with VITE_ prefix to frontend
// Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables
const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL ||
  "https://aziknzyxfrbhfpiljetg.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  // Fallback: Copy the value from your SUPABASE_ANON_KEY in Vercel
  // and add it as VITE_SUPABASE_ANON_KEY
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aWtuen14ZnJiaGZwaWxqZXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjUxMDksImV4cCI6MjA3NDAwMTEwOX0.6yo-RHL7QDu-ZUK0uba7HWV7yTIr6sJVgafMRS7EdTU";

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase configuration missing!");
  throw new Error("Supabase URL and Anon Key are required");
}

// Debug logging
if (import.meta.env.DEV || window.location.hostname.includes("vercel")) {
  console.log("🔍 Supabase Client Configuration:");
  console.log("   URL:", SUPABASE_URL);
  console.log(
    "   Anon Key (first 30 chars):",
    SUPABASE_ANON_KEY.substring(0, 30) + "..."
  );
  console.log(
    "   VITE_SUPABASE_ANON_KEY:",
    import.meta.env?.VITE_SUPABASE_ANON_KEY
      ? "✅ Set"
      : "❌ Not set (using fallback)"
  );
  if (!import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    console.warn(
      "⚠️  Add VITE_SUPABASE_ANON_KEY in Vercel env vars for production!"
    );
  }
}

// Create Supabase client with auth configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // Use PKCE flow for better security
  },
  global: {
    headers: {
      "x-client-info": "betterapp-web",
    },
  },
});
