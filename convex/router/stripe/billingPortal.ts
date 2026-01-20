import { v } from "convex/values";
import { serverAction } from "../../procedures";
import { stripe } from "../../lib/stripe";

export const action = serverAction({
  args: {
    stripeCustomerId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, { stripeCustomerId, returnUrl }) => {
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${returnUrl}`,
    })

    if (!portal.url)
      throw new Error("No URL returned from Stripe billing portal");

    return portal.url;
  }
})