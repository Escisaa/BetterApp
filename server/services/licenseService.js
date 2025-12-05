// License Service - Handles license validation and management
import { createClient } from "@supabase/supabase-js";

let supabase = null;

export function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Use service_role key for server-side operations (bypasses RLS)
    // Fall back to anon key if service_role not available
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const missing = [];
      if (!supabaseUrl) missing.push("SUPABASE_URL");
      if (
        !process.env.SUPABASE_SERVICE_ROLE_KEY &&
        !process.env.SUPABASE_ANON_KEY
      ) {
        missing.push(
          "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY as fallback)"
        );
      }
      throw new Error(`Missing Supabase configuration: ${missing.join(", ")}`);
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Validate a license key
 * Returns: { valid: boolean, plan: string, expiresAt: Date, message: string }
 */
export async function validateLicense(licenseKey, deviceId = null) {
  try {
    const supabase = getSupabaseClient();
    // Find license
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*, subscriptions(*)")
      .eq("license_key", licenseKey)
      .single();

    if (error || !license) {
      return {
        valid: false,
        message: "Invalid license key",
      };
    }

    // Check if license is active
    if (!license.is_active) {
      return {
        valid: false,
        message: "License has been deactivated",
      };
    }

    // Check if license has expired
    const expiresAt = new Date(license.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return {
        valid: false,
        message: "License has expired",
      };
    }

    // Device binding: Check if license is already bound to a different device
    if (license.device_id && license.device_id !== deviceId) {
      return {
        valid: false,
        message: "License is already activated on another device",
      };
    }

    // Update device ID if provided and not yet bound
    if (deviceId && !license.device_id) {
      await supabase
        .from("licenses")
        .update({ device_id: deviceId, updated_at: new Date().toISOString() })
        .eq("id", license.id);
    }

    // Return license info
    return {
      valid: true,
      plan: license.subscriptions?.plan || "monthly",
      expiresAt: expiresAt,
      subscriptionId: license.subscription_id,
      message: "License is valid",
    };
  } catch (error) {
    console.error("Error validating license:", error);
    return {
      valid: false,
      message: "Error validating license",
    };
  }
}

/**
 * Get license info (without validation)
 */
export async function getLicenseInfo(licenseKey) {
  try {
    const supabase = getSupabaseClient();
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*, subscriptions(*)")
      .eq("license_key", licenseKey)
      .single();

    if (error || !license) {
      return null;
    }

    return {
      licenseKey: license.license_key,
      plan: license.subscriptions?.plan,
      status: license.subscriptions?.status,
      expiresAt: license.expires_at,
      isActive: license.is_active,
      deviceId: license.device_id,
      stripeCustomerId: license.subscriptions?.stripe_customer_id,
    };
  } catch (error) {
    console.error("Error getting license info:", error);
    return null;
  }
}

/**
 * Get an active license for a user by email
 * Checks both subscriptions table and licenses table for email
 */
export async function getActiveLicenseByEmail(email) {
  try {
    const supabase = getSupabaseClient();
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`🔍 Looking for license for email: ${normalizedEmail}`);

    // STRATEGY 1: Find active subscription by email
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("id, plan, status, current_period_end, email, created_at")
      .eq("email", normalizedEmail)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subscription && !subscriptionError) {
      console.log(`✅ Found subscription by email: ${subscription.id}`);

      // Check if subscription is still valid
      if (subscription.current_period_end) {
        const periodEnd = new Date(subscription.current_period_end);
        if (periodEnd < new Date()) {
          console.log(`❌ Subscription expired on ${periodEnd}`);
          return null;
        }
      }

      // Find active license for this subscription
      const { data: license, error: licenseError } = await supabase
        .from("licenses")
        .select("*")
        .eq("subscription_id", subscription.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (license && !licenseError) {
        const expiresAt = new Date(license.expires_at);
        if (expiresAt >= new Date()) {
          console.log(`✅ Found valid license: ${license.license_key}`);
          return {
            licenseKey: license.license_key,
            plan: subscription.plan || "yearly",
            status: subscription.status,
            subscriptionId: subscription.id,
            currentPeriodEnd: subscription.current_period_end,
            expiresAt: license.expires_at,
          };
        }
      }
    }

    // STRATEGY 2: Find license directly by user_email
    console.log(`🔍 Trying direct license lookup by user_email...`);
    const { data: directLicense, error: directError } = await supabase
      .from("licenses")
      .select("*, subscriptions(*)")
      .eq("user_email", normalizedEmail)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (directLicense && !directError) {
      const expiresAt = new Date(directLicense.expires_at);
      if (expiresAt >= new Date()) {
        console.log(
          `✅ Found valid license by user_email: ${directLicense.license_key}`
        );
        return {
          licenseKey: directLicense.license_key,
          plan: directLicense.subscriptions?.plan || "yearly",
          status: directLicense.subscriptions?.status || "active",
          subscriptionId: directLicense.subscription_id,
          currentPeriodEnd: directLicense.subscriptions?.current_period_end,
          expiresAt: directLicense.expires_at,
        };
      }
    }

    console.log(`❌ No valid license found for ${normalizedEmail}`);
    return null;
  } catch (error) {
    console.error("Error getting license by email:", error);
    return null;
  }
}

/**
 * Activate a license (mark as activated)
 */
export async function activateLicense(licenseKey, deviceId) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("licenses")
      .update({
        device_id: deviceId,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("license_key", licenseKey)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, license: data };
  } catch (error) {
    console.error("Error activating license:", error);
    return { success: false, error: error.message };
  }
}
