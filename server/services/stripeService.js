// Stripe Service - Handles webhook events and license generation
import { createClient } from "@supabase/supabase-js";
import { sendLicenseKey } from "./emailService.js";

// Import Stripe for customer lookup
let StripeModule = null;
async function getStripe() {
  if (!StripeModule) {
    StripeModule = (await import("stripe")).default;
  }
  return StripeModule;
}

let supabase = null;

function getSupabaseClient() {
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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(
        "⚠️  Using SUPABASE_ANON_KEY - consider using SUPABASE_SERVICE_ROLE_KEY for server operations"
      );
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
    console.log(`📥 Received Stripe webhook event: ${event.type}`);

    // Handle checkout.session.completed (happens first, has customer email)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Only process if it's a subscription
      if (session.mode === "subscription" && session.customer_email) {
        console.log(
          `✅ Checkout completed for ${session.customer_email}, waiting for subscription.created event...`
        );
        // The subscription.created event will handle the license creation
        return {
          success: true,
          message: "Checkout completed, waiting for subscription",
        };
      }
    }

    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      console.log(
        `📦 Processing subscription.created for subscription: ${subscription.id}`
      );
      console.log(`   Customer: ${subscription.customer}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Period start: ${subscription.current_period_start}`);
      console.log(`   Period end: ${subscription.current_period_end}`);

      // CRITICAL: Only process if subscription is active or trialing
      // Incomplete subscriptions haven't been paid yet - wait for payment_intent.succeeded
      if (
        subscription.status === "incomplete" ||
        subscription.status === "incomplete_expired"
      ) {
        console.log(
          `⏳ Subscription ${subscription.id} is incomplete - waiting for payment to complete`
        );
        return {
          success: true,
          message: "Subscription incomplete, waiting for payment",
        };
      }

      const supabase = getSupabaseClient();

      // Verify Supabase connection
      if (!supabase) {
        console.error(
          "❌ Supabase client not initialized - check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        );
        return { success: false, error: "Database not configured" };
      }

      // Validate and convert dates safely
      const periodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : new Date().toISOString();
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Default to 1 year from now

      // Create subscription record
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          plan:
            subscription.items?.data?.[0]?.price?.recurring?.interval === "year"
              ? "yearly"
              : "monthly",
          status: subscription.status || "active",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          email: subscription.customer_email || "",
        })
        .select()
        .single();

      if (subError) {
        console.error("❌ Error creating subscription:", subError);
        console.error("   Full error:", JSON.stringify(subError, null, 2));
        // Check if it's an API key issue
        if (
          subError.message?.includes("Invalid API key") ||
          subError.message?.includes("JWT")
        ) {
          console.error(
            "   ⚠️  SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) is invalid!"
          );
          console.error(
            "   💡 Get your service_role key from Supabase Dashboard → Settings → API"
          );
        }
        return { success: false, error: subError.message };
      }

      // Generate license key
      const licenseKey = generateLicenseKey();
      const expiresAt = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Default to 1 year from now

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
        console.error("❌ Error creating license:", licenseError);
        console.error("   Full error:", JSON.stringify(licenseError, null, 2));
        // Check if it's an API key issue
        if (
          licenseError.message?.includes("Invalid API key") ||
          licenseError.message?.includes("JWT")
        ) {
          console.error(
            "   ⚠️  SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) is invalid!"
          );
          console.error(
            "   💡 Get your service_role key from Supabase Dashboard → Settings → API"
          );
        }
        return { success: false, error: licenseError.message };
      }

      // Fetch customer email from Stripe
      let customerEmail =
        subscription.customer_email ||
        subData.email ||
        subscription.metadata?.email;

      // If no email, fetch customer from Stripe
      if (!customerEmail && subscription.customer) {
        try {
          const Stripe = await getStripe();
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          const customer = await stripe.customers.retrieve(
            subscription.customer
          );
          if (customer && !customer.deleted && customer.email) {
            customerEmail = customer.email;
            // Update subscription with email
            await supabase
              .from("subscriptions")
              .update({ email: customerEmail })
              .eq("id", subData.id);
            console.log(
              `✅ Fetched customer email from Stripe: ${customerEmail}`
            );
          }
        } catch (customerError) {
          console.warn(
            "Failed to fetch customer from Stripe:",
            customerError.message
          );
        }
      }

      // Link subscription to user email if they signed up
      if (customerEmail) {
        try {
          await supabase
            .from("users")
            .update({
              subscription_id: subData.id,
              has_license: true,
              updated_at: new Date().toISOString(),
            })
            .eq("email", customerEmail.toLowerCase());
        } catch (userError) {
          // Ignore - user might not exist yet
          console.log("User not found for email linking (optional)");
        }
      }

      // Send license key to customer email
      if (customerEmail) {
        console.log(
          `📧 Attempting to send license email to ${customerEmail}...`
        );
        const emailResult = await sendLicenseKey(
          customerEmail,
          licenseKey,
          subData.plan
        );
        if (!emailResult.success) {
          console.error(
            `❌ FAILED to send license email to ${customerEmail}:`,
            emailResult.error
          );
          // CRITICAL: Always log the license key so it can be manually sent
          console.log(`\n⚠️  ===========================================`);
          console.log(`⚠️  LICENSE KEY GENERATED BUT EMAIL FAILED!`);
          console.log(`⚠️  Email: ${customerEmail}`);
          console.log(`⚠️  License Key: ${licenseKey}`);
          console.log(`⚠️  Subscription ID: ${subscription.id}`);
          console.log(`⚠️  ===========================================\n`);
          // Don't fail the webhook - license is still created
        } else {
          console.log(
            `✅ License email sent successfully to ${customerEmail} (Message ID: ${emailResult.messageId})`
          );
        }
      } else {
        console.warn(`⚠️  No email found for subscription ${subscription.id}`);
        console.log(`\n⚠️  ===========================================`);
        console.log(`⚠️  LICENSE KEY GENERATED BUT NO EMAIL!`);
        console.log(`⚠️  License Key: ${licenseKey}`);
        console.log(`⚠️  Subscription ID: ${subscription.id}`);
        console.log(`⚠️  Customer ID: ${subscription.customer || "N/A"}`);
        console.log(`⚠️  ===========================================\n`);
      }

      console.log(
        `License created: ${licenseKey} for subscription ${subscription.id}`
      );

      return { success: true, licenseKey, subscription: subData };
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      console.log(
        `📝 Processing subscription.updated for subscription: ${subscription.id}`
      );
      console.log(`   Status: ${subscription.status}`);

      const supabase = getSupabaseClient();

      // Verify Supabase connection
      if (!supabase) {
        console.error(
          "❌ Supabase client not initialized - check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        );
        return { success: false, error: "Database not configured" };
      }

      // If subscription just became active, create subscription and license if they don't exist
      if (subscription.status === "active") {
        let existingSub = await supabase
          .from("subscriptions")
          .select("id, licenses(*)")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        // If subscription doesn't exist, create it first
        if (!existingSub.data || existingSub.error) {
          console.log(`   Subscription not found in DB, creating it...`);

          // Get customer email
          let customerEmail = subscription.customer_email;
          if (!customerEmail && subscription.customer) {
            try {
              const Stripe = await getStripe();
              const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
              const customer = await stripe.customers.retrieve(
                subscription.customer
              );
              if (customer && !customer.deleted && customer.email) {
                customerEmail = customer.email;
              }
            } catch (e) {
              console.warn("Could not fetch customer email:", e.message);
            }
          }

          // Create subscription record
          const periodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date().toISOString();
          const periodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

          const { data: newSubData, error: subError } = await supabase
            .from("subscriptions")
            .insert({
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              plan:
                subscription.items?.data?.[0]?.price?.recurring?.interval ===
                "year"
                  ? "yearly"
                  : "monthly",
              status: subscription.status || "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
              email: customerEmail || "",
            })
            .select()
            .single();

          if (subError) {
            console.error("❌ Error creating subscription:", subError);
            return { success: false, error: subError.message };
          }

          existingSub = { data: newSubData, error: null };
        }

        // If subscription exists but no license, create one
        if (
          existingSub.data &&
          (!existingSub.data.licenses || existingSub.data.licenses.length === 0)
        ) {
          console.log(
            `   Creating license for newly activated subscription...`
          );
          const licenseKey = generateLicenseKey();
          const expiresAt = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

          const { data: licenseData, error: licenseError } = await supabase
            .from("licenses")
            .insert({
              license_key: licenseKey,
              subscription_id: existingSub.data.id,
              expires_at: expiresAt,
              is_active: true,
            })
            .select()
            .single();

          if (!licenseError && licenseData) {
            // Send email
            let customerEmail = subscription.customer_email;
            if (!customerEmail && subscription.customer) {
              try {
                const Stripe = await getStripe();
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
                const customer = await stripe.customers.retrieve(
                  subscription.customer
                );
                if (customer && !customer.deleted && customer.email) {
                  customerEmail = customer.email;
                }
              } catch (e) {
                console.warn("Could not fetch customer email:", e.message);
              }
            }

            if (customerEmail) {
              const { sendLicenseKey } = await import("./emailService.js");
              const emailResult = await sendLicenseKey(
                customerEmail,
                licenseKey,
                existingSub.data.plan || "yearly"
              );
              if (emailResult.success) {
                console.log(`✅ License email sent to ${customerEmail}`);
              } else {
                console.error(`❌ Failed to send email: ${emailResult.error}`);
              }
            }
          }
        }
      }

      // Validate and convert dates safely
      const updateData = {
        status: subscription.status,
      };

      if (subscription.current_period_start) {
        updateData.current_period_start = new Date(
          subscription.current_period_start * 1000
        ).toISOString();
      }

      if (subscription.current_period_end) {
        updateData.current_period_end = new Date(
          subscription.current_period_end * 1000
        ).toISOString();
      }

      // Update subscription
      const { error } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("❌ Error updating subscription:", error);
        console.error("   Full error:", JSON.stringify(error, null, 2));
        if (
          error.message?.includes("Invalid API key") ||
          error.message?.includes("JWT")
        ) {
          console.error(
            "   ⚠️  SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) is invalid!"
          );
          console.error(
            "   💡 Get your service_role key from Supabase Dashboard → Settings → API"
          );
        }
        return { success: false, error: error.message };
      }

      // Update license expiry (only if subscription exists)
      const subResult = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (subResult.data && subResult.data.id) {
        const expiresAt = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        await supabase
          .from("licenses")
          .update({ expires_at: expiresAt })
          .eq("subscription_id", subResult.data.id);
      }

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
