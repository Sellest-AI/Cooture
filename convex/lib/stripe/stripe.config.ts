import { env } from "../../env";
import Stripe from 'stripe';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});