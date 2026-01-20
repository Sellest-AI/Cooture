import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { SUBSCRIPTION_STATUS } from "../../schema/subscriptions";
import { isSubscriptionActive } from "../../functions/subscriptions";

export const _internal = internalMutation({
  args: { stripeSubscriptionId: v.string(), status: SUBSCRIPTION_STATUS },
  handler: async (ctx, args): Promise<boolean> => {
    try {
      const { stripeSubscriptionId, status } = args;

      if (status === "CANCELED")
        throw new Error("Subscription is canceled. Please use the cancel subscription mutation instead.");

      // Update the subscription status in the database
      const subscription = await ctx.db.query("subscriptions")
        .filter((q) => q.eq(q.field("stripeSubscriptionId"), stripeSubscriptionId))
        .order('desc')
        .first();

      if (!subscription) return false;

      const isActive = isSubscriptionActive({ ...subscription, status });
      await ctx.db.patch(subscription._id, { status, isActive });

      return true;
    } catch {
      return false;
    }
  }
})