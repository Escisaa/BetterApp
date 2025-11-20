// Stripe Checkout Service - Creates checkout sessions
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
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(priceId, successUrl, cancelUrl) {
  try {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product: "BetterApp Premium",
      },
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: error.message };
  }
}
