import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { internalMutation } from "../../_generated/server";
import { SUBSCRIPTION_STATUS, SUBSCRIPTIONS_NAME } from "../../schema/subscriptions";
import { internal } from "../../_generated/api";
import { isSubscriptionActive } from "../../functions/subscriptions";

export const _internal = internalMutation({
  args: {
    userId: v.id('users'),
    status: SUBSCRIPTION_STATUS,
    internalProductId: SUBSCRIPTIONS_NAME,
    // --- stripe ---
    stripeSubscriptionId: v.optional(v.string()),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    // --- renewal ---
    internalRenewAt: v.optional(v.number()),
    externalRenewAt: v.optional(v.number()),
    renewalFunctionId: v.optional(v.id("_scheduled_functions")),
    // --- dates ---
    startAt: v.number(),
    expireAt: v.optional(v.number()),
    // --- usage ---
    limits: v.object({
      tokensAmount: v.optional(v.number()),
      creditsAmount: v.optional(v.number()),
    })
  },
  handler: async (ctx, args): Promise<Id<'subscriptions'> | null> => {
    const { userId, stripeSubscriptionId, stripeProductId, status, limits, internalProductId,
      stripePriceId, internalRenewAt, externalRenewAt, startAt, expireAt, renewalFunctionId } = args;

    const subscription = await ctx.db.insert("subscriptions", {
      userId,
      status,
      isActive: false,
      internalProductId,
      stripeSubscriptionId,
      stripeProductId,
      stripePriceId,
      startAt: startAt,
      expireAt,
      externalRenewAt,
      internalRenewAt,
      renewalFunctionId,
      usage: {
        tokensLimit: limits.tokensAmount,
        tokensUsed: 0,
        creditLimit: limits.creditsAmount,
        creditsUsed: 0,
      },
    });

    await ctx.scheduler.runAt(startAt, internal.router.subscriptions.createSubscription._internal_delay, { subscriptionId: subscription });

    return subscription;
  }
})

export const _internal_delay = internalMutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, { subscriptionId }) => {
    const subscription = await ctx.db.get(subscriptionId);

    // If the subscription doesn't exist, we don't need to do anything
    if (!subscription) return false;

    // If the subscription is not supposed to be active, we don't need to do anything
    if (!isSubscriptionActive(subscription)) return false;

    // Set the subscription to active
    await ctx.db.patch(subscription._id, { isActive: true });

    return true;
  }
})