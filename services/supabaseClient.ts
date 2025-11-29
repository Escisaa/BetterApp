// Supabase Client for Frontend Authentication
import { createClient } from "@supabase/supabase-js";

const getSupabaseUrl = (): string => {
  // Check for VITE_ prefixed env var (Vite exposes these)
  const envUrl = import.meta.env?.VITE_SUPABASE_URL as string;
  if (envUrl) {
    return envUrl;
  }

  // Fallback to hardcoded URL (same as backend uses)
  return "https://aziknzyxfrbhfpiljetg.supabase.co";
};

const getSupabaseAnonKey = (): string => {
  // Check for VITE_ prefixed env var (Vite exposes these)
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string;
  if (envKey) {
    return envKey;
  }

  // Fallback to hardcoded anon key (same as backend uses)
  // Note: Anon key is safe to expose in frontend (protected by RLS)
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aWtuen14ZnJiaGZwaWxqZXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjUxMDksImV4cCI6MjA3NDAwMTEwOX0.6yo-RHL7QDu-ZUK0uba7HWV7yTIr6sJVgafMRS7EdTU";
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
