// Supabase Client for Frontend Authentication
import { createClient } from "@supabase/supabase-js";

const getSupabaseUrl = (): string => {
  // Check for explicit URL in env
  const envUrl = import.meta.env?.VITE_SUPABASE_URL as string;
  if (envUrl) {
    return envUrl;
  }

  // Production: use Render backend's Supabase URL (same as backend)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    !window.location.hostname.includes("127.0.0.1")
  ) {
    return "https://aziknzyxfrbhfpiljetg.supabase.co";
  }

  // Development: localhost
  return (
    import.meta.env?.VITE_SUPABASE_URL ||
    "https://aziknzyxfrbhfpiljetg.supabase.co"
  );
};

const getSupabaseAnonKey = (): string => {
  // MUST be set in Vercel environment variables
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string;

  if (!envKey) {
    console.error(
      "❌ VITE_SUPABASE_ANON_KEY not set in Vercel environment variables"
    );
    console.error(
      "   Add it in Vercel → Project Settings → Environment Variables"
    );
    throw new Error("VITE_SUPABASE_ANON_KEY environment variable is required");
  }

  return envKey;
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
