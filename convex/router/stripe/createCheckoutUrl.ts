import { v } from "convex/values";
import { serverAction } from "../../procedures";
import { checkAutoApplyCoupon, stripe } from "../../lib/stripe";
import { internal } from "../../_generated/api";
import type Stripe from "stripe";

const args = {
  customerId: v.string(),
  priceId: v.string(),
  coupon: v.optional(v.string()),
  // if the user is not eligible for a free trial, this will be overwritten
  trialDays: v.optional(v.number()),
  successUrl: v.string(),
  cancelUrl: v.string(),
  allowPromotionCodes: v.optional(v.boolean()),
  referral: v.optional(v.string()),
}

type ReturnType = Promise<Stripe.Response<Stripe.Checkout.Session>>

export const action = serverAction({
  args,
  handler: async (ctx, data): ReturnType => {
    const { priceId, referral, customerId, cancelUrl, successUrl, allowPromotionCodes } = data;

    const user = await ctx.runQuery(internal.router.users.getFromStripeId._internal, { stripeCustomerId: customerId });
    if (!user) throw new Error("User not found");

    const code = await checkAutoApplyCoupon(priceId, data.coupon);
    const freeTrialDays = user.canTakeFreeTrial ? (data.trialDays ?? 0) : 0;

    const metadata = referral ? { promotekit_referral: referral } : undefined;
    const discounts = code ? [{ coupon: code.coupon.id }] : undefined;

    const subscriptionData = Number(freeTrialDays) > 0 ? { trial_period_days: freeTrialDays } : undefined;

    return stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'link'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      discounts: discounts,
      subscription_data: subscriptionData,
      // trial_end: trialEndDateTime,
      allow_promotion_codes: discounts ? undefined : (allowPromotionCodes ?? false),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })
  }
})