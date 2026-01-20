import { v } from "convex/values";
import { serverAction } from "../../procedures";
import { internal } from "../../_generated/api";
import { checkAutoApplyCoupon, stripe, stripeDateToNumber } from "../../lib/stripe";
import { Id } from "../../_generated/dataModel";

const createServerSideSubscription = async (data: {
  customerId: string,
  priceId: string,
  trialEndDate?: Date,
  referral?: string,
  promotionCode?: string,
  cancelCurrentSubscription?: {
    id: string,
    prorate: boolean
  }
}) => {
  const { customerId, priceId, trialEndDate, promotionCode, referral, cancelCurrentSubscription } = data;

  if (cancelCurrentSubscription) {
    await stripe.subscriptions.cancel(cancelCurrentSubscription.id, {
      prorate: cancelCurrentSubscription.prorate,
      cancellation_details: { comment: 'Switching to another plan' }
    }).catch(() => null)
  }

  // stripe uses the seconds format instead of the milliseconds format
  const trialEndDateTime = trialEndDate ? Math.round((trialEndDate.getTime() / 1000)) : undefined;

  const metadata = referral ? { promotekit_referral: referral } : undefined;
  const discount = promotionCode ? [{ promotion_code: promotionCode }] : undefined;

  // create subscription
  const result = await stripe.subscriptions.create({
    customer: customerId,
    proration_behavior: 'always_invoice',
    items: [{ price: priceId }],
    expand: ['latest_invoice'], // Expand to get payment status
    trial_end: trialEndDateTime,
    discounts: discount,
    metadata
  });

  const recurring = result.items.data[0].price.recurring;
  const current_period_start = result.items.data[0].current_period_start;

  return {
    ...result,
    recurring,
    current_period_start
  }
}

type ActionReturnType = Awaited<ReturnType<typeof createServerSideSubscription>> & {
  internalId: Id<'subscriptions'> | null;
};

export const action = serverAction({
  args: {
    stripeCustomerId: v.string(),
    priceId: v.string(),
    // if the user is not eligible for a free trial, this will be overwritten
    freeTrialEndAt: v.optional(v.number()),
    coupon: v.optional(v.string()),
    referral: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ActionReturnType> => {
    const { stripeCustomerId, priceId, freeTrialEndAt, referral, coupon } = args;
    const user = await ctx.runQuery(internal.router.users.getFromStripeId._internal, { stripeCustomerId });
    if (!user) throw new Error("User not found");

    const code = await checkAutoApplyCoupon(priceId, coupon);

    const currentSubscription = await ctx.runQuery(internal.router.subscriptions.getUserSubscription._internal, { userId: user._id });
    const currentSubscriptionStripeId = currentSubscription?.stripeSubscriptionId;

    const cancelProrate = currentSubscription?.internalRenewAt ??
      currentSubscription?.usage.creditsUsed == 0 ? true : false;

    const freeTrial = user.canTakeFreeTrial ? freeTrialEndAt : undefined;

    // create new subscription
    const newStripeSubscription = await createServerSideSubscription({
      customerId: stripeCustomerId,
      priceId: priceId,
      trialEndDate: freeTrial ? new Date(freeTrial) : undefined,
      promotionCode: code?.coupon.id,
      referral: referral,
      cancelCurrentSubscription: currentSubscriptionStripeId ? {
        id: currentSubscriptionStripeId,
        prorate: cancelProrate,
      } : undefined,
    });

    // if is a yearly subscription, set the internalRenewAt to the next month
    const internalRenewAt = newStripeSubscription.recurring?.interval === "year" ? new Date(stripeDateToNumber(newStripeSubscription.current_period_start)) : undefined;
    internalRenewAt?.setMonth(internalRenewAt.getMonth() + 1);

    const internalSubscriptionId = await ctx.runAction(internal.router.stripe.createDbSubscription.action, {
      userId: user._id,
      stripeSubscriptionId: newStripeSubscription.id,
      internalRenewAt: internalRenewAt?.getTime()
    })

    return {
      ...newStripeSubscription,
      internalId: internalSubscriptionId,
    };
  }
})

