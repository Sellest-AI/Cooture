import { v } from "convex/values";
import { internalMutation } from "../../procedures";
import { internal } from "../../_generated/api";
import { getUserSubscription, isSubscriptionActive } from "../../functions/subscriptions";

export const _internal = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    cancelAt: v.number(),
  },

  handler: async (ctx, args) => {
    const subscription = await ctx.db.query("subscriptions")
      .filter((q) => q.eq(q.field("stripeSubscriptionId"), args.stripeSubscriptionId))
      .order('desc')
      .first();

    if (!subscription) return false;

    await ctx.db.patch(subscription._id, { status: "CANCELED", expireAt: args.cancelAt });

    await ctx.scheduler.runAt(args.cancelAt, internal.router.subscriptions.cancelSubscription._internal_delay, { subscriptionId: subscription._id });

    return true;
  },
});

/** 
 * Only called internally by the scheduler to delay a subscription.
 * Do not call this mutation directly.
 */
export const _internal_delay = internalMutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, { subscriptionId }) => {
    const subscription = await ctx.db.get(subscriptionId);

    // If the subscription doesn't exist, we don't need to do anything
    if (!subscription) return false;

    // If the subscription is not canceled, we don't need to do anything
    if (subscription.status !== 'CANCELED') return false;

    // If it should still be active, we don't need to do anything
    if (isSubscriptionActive(subscription)) return false;

    // Cancel renewal function if it exists
    if (subscription.renewalFunctionId) await ctx.scheduler.cancel(subscription.renewalFunctionId);

    // Set the subscription to inactive
    await ctx.db.patch(subscription._id, { isActive: false })

    const userId = subscription.userId;
    const currentSubscription = await getUserSubscription(ctx, userId);
    if (currentSubscription) return true;

    // if the user has no active subscription, create a free one
    await ctx.runMutation(internal.router.subscriptions.createFreeSubscription._internal, { userId });

    return true;
  }
})