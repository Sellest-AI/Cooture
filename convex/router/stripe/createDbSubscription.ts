import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { getStripeSubscription, stripeDateToNumber, stripeProductToInternalProductId, stripeStatusToServerStatus } from "@/lib/stripe";
import { SUBSCRIPTIONS, isSubscriptionActive } from "../../functions/subscriptions";

const args = {
  userId: v.id("users"),
  stripeSubscriptionId: v.string(),
  internalStartAt: v.optional(v.number()),
  internalRenewAt: v.optional(v.number()),
}

export const action = internalAction({
  args,
  handler: async (ctx, args): Promise<Id<'subscriptions'> | null> => {
    const { userId, stripeSubscriptionId, internalRenewAt } = args;

    const stripeSubscription = await getStripeSubscription(stripeSubscriptionId);
    if (!stripeSubscription) throw new Error("Stripe Subscription not found");

    const stripeProductId = stripeSubscription.product_id;
    const stripePriceId = stripeSubscription.price_id;
    const expireAt = stripeDateToNumber(stripeSubscription.cancel_at) ?? undefined;
    const externalRenewAt = stripeDateToNumber(stripeSubscription.current_period_end) ?? undefined;
    const startAt = stripeDateToNumber(stripeSubscription.current_period_start) ?? undefined;
    const status = stripeStatusToServerStatus(stripeSubscription.status);

    const internalProductId = stripeProductToInternalProductId(stripeSubscription.product);
    const limits = SUBSCRIPTIONS.find((s) => s.name === internalProductId);
    if (!limits) throw new Error("Subscription product not found");

    const creditsAmount = Number(stripeSubscription.product.metadata.credits) || limits.creditsAmount;
    const tokensAmount = Number(stripeSubscription.product.metadata.tokens) || limits.tokensAmount;

    // if the stripeSubscription is not active, we shouldn't create a new subscription
    const isSupposedToBeActive = isSubscriptionActive({ status, startAt, expireAt, externalRenewAt, internalRenewAt, internalProductId });
    if (!isSupposedToBeActive) return null;

    // If the subscription is expired, we don't want to create a new one
    if (expireAt && expireAt <= Date.now()) return null;

    // Cancel any existing subscriptions
    await ctx.runMutation(internal.router.subscriptions.endOne._internal, { userId });

    // Schedule the next renewal date
    let renewalId: Id<'_scheduled_functions'> | undefined = undefined;
    if (internalRenewAt) {
      const finalStartAt = args.internalStartAt ?? startAt;
      const newStartAt = internalRenewAt;
      const dateDiff = newStartAt - finalStartAt;

      let nextInternalRenewAt: number | undefined = newStartAt + dateDiff;
      // if the subscription is canceled, we don't want to schedule the next renewal date
      if (expireAt && nextInternalRenewAt >= expireAt)
        nextInternalRenewAt = undefined;
      // if the next renewal date is handled externally, we don't want to schedule the next renewal date
      if (externalRenewAt && nextInternalRenewAt && nextInternalRenewAt >= externalRenewAt)
        nextInternalRenewAt = undefined;

      const nextData: typeof args = {
        ...args,
        internalStartAt: newStartAt,
        internalRenewAt: nextInternalRenewAt
      }

      renewalId = await ctx.scheduler.runAt(internalRenewAt + 1, internal.router.stripe.createDbSubscription.action, nextData);
    }

    const subscription = await ctx.runMutation(internal.router.subscriptions.createSubscription._internal, {
      userId,
      status,
      internalProductId: internalProductId,
      stripeSubscriptionId,
      stripeProductId,
      stripePriceId,
      startAt: args.internalStartAt ?? startAt,
      expireAt,
      externalRenewAt,
      internalRenewAt,
      renewalFunctionId: renewalId,
      limits: {
        creditsAmount: creditsAmount,
        tokensAmount: tokensAmount
      }
    });

    return subscription;
  }
})