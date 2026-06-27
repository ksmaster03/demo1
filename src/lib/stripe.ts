import Stripe from "stripe";

// Stripe singleton — server-side only
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});
