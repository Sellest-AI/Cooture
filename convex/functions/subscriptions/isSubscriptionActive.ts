import { Infer } from "convex/values";
import { Id } from "../../_generated/dataModel"
import { SUBSCRIPTION_STATUS, SUBSCRIPTIONS_NAME } from "../../schema/subscriptions"

type SubscriptionStatus = Infer<typeof SUBSCRIPTION_STATUS>;
type SubscriptionName = Infer<typeof SUBSCRIPTIONS_NAME>;

type Subscription = {
  _id?: Id<'subscriptions'>,
  status: SubscriptionStatus,
  startAt: number,
  expireAt?: number,
  internalRenewAt?: number,
  externalRenewAt?: number,
  internalProductId: SubscriptionName,
}

const ACTIVE_STATUSES = ['ACTIVE', 'TRIALING', 'CANCELED'] as const;

// Internal renewals: give a grace period (e.g., 1 hour) to allow renewal job to complete
const INTERNAL_GRACE_PERIOD_MS = 60 * 60 * 1000; // 1 hour

export const isSubscriptionActive = (subscription: Subscription) => {
  // No grace period for free (INTERNAL) subscriptions
  const RUNTIME_INTERNAL_GRACE_PERIOD_MS =
    subscription.internalProductId === 'free' ? 0 : INTERNAL_GRACE_PERIOD_MS;

  // Check if the subscription is active based on its status
  if (!ACTIVE_STATUSES.some((s) => s === subscription.status)) return false;

  // Check if the subscription has started
  if (subscription.startAt > Date.now()) return false;

  // Check if the subscription has not expired
  if (subscription.expireAt && subscription.expireAt <= Date.now()) return false;

  // Check if the internal renewal date is valid
  if (subscription.internalRenewAt && (subscription.internalRenewAt + RUNTIME_INTERNAL_GRACE_PERIOD_MS) <= Date.now()) return false;

  // Check if the external renewal date is valid
  if (subscription.externalRenewAt && subscription.externalRenewAt <= Date.now()) return false;

  // If all checks pass, the subscription is active
  return true;
}
