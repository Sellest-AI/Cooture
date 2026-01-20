import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { stripe, getCurrentBillingPeriod, stripeDateToNumber, getStripeSubscription } from "../../lib/stripe";
import { internal } from "../../_generated/api";

const args = {
  userId: v.id("users"),
  stripeCustomerId: v.string(),
}

export const _private = internalAction({
  args, handler: async (ctx, args): Promise<boolean> => {
    const { userId, stripeCustomerId } = args;

    // check if user has an active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });

    const subscriptionId = subscriptions.data[0]?.id;
    if (!subscriptionId) return false;

    const subscription = await getStripeSubscription(subscriptionId);
    if (!subscription) return false;

    // if is a yearly subscription, set the internalRenewAt to the next month
    const isYearly = subscription.recurring?.interval === "year";
    const currentStartAt = getCurrentBillingPeriod(new Date(stripeDateToNumber(subscription.current_period_start)), new Date());
    const internalRenewAt = new Date(currentStartAt);
    internalRenewAt?.setMonth(internalRenewAt.getMonth() + 1);

    await ctx.runAction(internal.router.stripe.createDbSubscription.action, {
      userId: userId,
      stripeSubscriptionId: subscriptionId,
      internalStartAt: isYearly ? currentStartAt.getTime() : undefined,
      internalRenewAt: isYearly ? internalRenewAt?.getTime() : undefined,
    })

    return true;
  }
})