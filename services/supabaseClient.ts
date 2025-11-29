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
  // Check for explicit key in env
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string;
  if (envKey) {
    return envKey;
  }

  // Production/Development: use anon key
  return (
    import.meta.env?.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aWtuen14ZnJiaGZwaWxqZXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjUxMDksImV4cCI6MjA3NDAwMTEwOX0.6yo-RHL7QDu-ZUK0uba7HWV7yTIr6sJVgafMRS7EdTU"
  );
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
