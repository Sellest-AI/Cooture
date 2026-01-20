import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { getStripeSubscription, stripeDateToNumber } from "../../lib/stripe";
import { internal } from "../../_generated/api";

const args = { stripeSubscriptionId: v.string() }

export const action = internalAction({
  args, handler: async (ctx, { stripeSubscriptionId }): Promise<boolean> => {
    const stripeSubscription = await getStripeSubscription(stripeSubscriptionId);

    // If the subscription is not found, we consider it canceled
    if (!stripeSubscription) return true;

    const cancelAt = stripeDateToNumber(stripeSubscription.cancel_at) ?? Date.now();

    return ctx.runMutation(internal.router.subscriptions.cancelSubscription._internal, {
      stripeSubscriptionId: stripeSubscription.id,
      cancelAt,
    })
  },
})