import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";
import { SUBSCRIPTIONS } from "./subscription.config";

export const getUserSubscription = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_user_id_and_active', (q) => q.eq('userId', userId).eq('isActive', true))
    .order('desc')
    .collect();

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE' || s.status === 'TRIALING');

  // get the latest active subscription
  let subscription: typeof activeSubscriptions[0] | undefined = activeSubscriptions[0];

  // fallback to latest canceled subscription
  if (!subscription) subscription = subscriptions.find((s) => s.status === 'CANCELED');
  // fallback to latest incomplete subscription
  if (!subscription) subscription = subscriptions[0];

  if (!subscription) return null;

  const creditsLeft = (subscription.usage.creditLimit ?? Infinity) - subscription.usage.creditsUsed;

  const features = SUBSCRIPTIONS.find((s) => s.id === subscription.internalProductId)!.features;

  return {
    ...subscription,
    features: features,
    usage: {
      ...subscription.usage,
      creditsLeft
    }
  };
}