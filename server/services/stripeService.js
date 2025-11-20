// Stripe Service - Handles webhook events and license generation
import { createClient } from "@supabase/supabase-js";
import { sendLicenseKey } from "./emailService.js";

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Generate a unique license key
 */
function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(Math.random().toString(36).substring(2, 6).toUpperCase());
  }
  return segments.join("-");
}

/**
 * Create subscription and license from Stripe webhook
 */
export async function handleStripeWebhook(event) {
  try {
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object;

      const supabase = getSupabaseClient();
      // Create subscription record
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          plan:
            subscription.items.data[0].price.recurring.interval === "year"
              ? "yearly"
              : "monthly",
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          email: subscription.customer_email || "",
        })
        .select()
        .single();

      if (subError) {
        console.error("Error creating subscription:", subError);
        return { success: false, error: subError.message };
      }

      // Generate license key
      const licenseKey = generateLicenseKey();
      const expiresAt = new Date(
        subscription.current_period_end * 1000
      ).toISOString();

      // Create license
      const { data: licenseData, error: licenseError } = await supabase
        .from("licenses")
        .insert({
          license_key: licenseKey,
          subscription_id: subData.id,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .single();

      if (licenseError) {
        console.error("Error creating license:", licenseError);
        return { success: false, error: licenseError.message };
      }

      // Send license key to customer email
      const customerEmail =
        subscription.customer_email ||
        subData.email ||
        subscription.metadata?.email;
      if (customerEmail) {
        const emailResult = await sendLicenseKey(
          customerEmail,
          licenseKey,
          subData.plan
        );
        if (!emailResult.success) {
          console.error("Failed to send license email:", emailResult.error);
          // Don't fail the webhook if email fails
        }
      } else {
        console.warn(
          `No email found for subscription ${subscription.id}, license key: ${licenseKey}`
        );
      }

      console.log(
        `License created: ${licenseKey} for subscription ${subscription.id}`
      );

      return { success: true, licenseKey, subscription: subData };
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;

      const supabase = getSupabaseClient();
      // Update subscription
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Error updating subscription:", error);
        return { success: false, error: error.message };
      }

      // Update license expiry
      const expiresAt = new Date(
        subscription.current_period_end * 1000
      ).toISOString();
      const subResult = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();
      await supabase
        .from("licenses")
        .update({ expires_at: expiresAt })
        .eq("subscription_id", subResult.data.id);

      return { success: true };
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      const supabase = getSupabaseClient();
      // Deactivate license
      const subResult = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();
      await supabase
        .from("licenses")
        .update({ is_active: false })
        .eq("subscription_id", subResult.data.id);

      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);

      return { success: true };
    }

    return { success: true, message: "Event handled" };
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return { success: false, error: error.message };
  }
}
