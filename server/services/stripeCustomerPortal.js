// Stripe Customer Portal Service
import Stripe from "stripe";

let stripe = null;

function getStripeClient() {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    stripe = new Stripe(stripeSecretKey);
  }
  return stripe;
}

/**
 * Create a Stripe Customer Portal session
 * This allows users to manage their subscription (cancel, update payment, etc.)
 */
export async function createCustomerPortalSession(customerId, returnUrl) {
  try {
    const stripe = getStripeClient();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl, // Where to redirect after managing subscription
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return { success: false, error: error.message };
  }
}
