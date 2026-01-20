import type Stripe from "stripe";
import { SUBSCRIPTION_STATUS, SUBSCRIPTIONS_NAME } from "../../schema/subscriptions";

export const stripeDateToNumber = <T extends number | null>(date: T): T => {
  if (!date) return null as T;
  return date * 1000 as T;
}

export const stripeStatusToServerStatus = (status: string): typeof SUBSCRIPTION_STATUS.type =>
  status === "incomplete" ? "INCOMPLETE" :
    status === "incomplete_expired" ? "INCOMPLETE_EXPIRED" :
      status === "active" ? "ACTIVE" :
        status === "trialing" ? "TRIALING" :
          status === "past_due" ? "PAST_DUE" :
            status === "unpaid" ? "UNPAID" :
              status === "canceled" ? "CANCELED" :
                status === "paused" ? "PAUSED" :
                  "ENDED";

export const stripeProductToInternalProductId = (product: Stripe.Product): typeof SUBSCRIPTIONS_NAME.type => {
  if (product.metadata?.product_id === 'starter') return 'starter';
  if (product.metadata?.product_id === 'creative') return 'creative';
  if (product.metadata?.product_id === 'professional') return 'professional';
  return 'free';
}

type SanitizedPrice = Stripe.Price & { amount: number, amountDecimal: string }
export const sanitizePrice = (price: Stripe.Price): SanitizedPrice => ({
  ...price,
  amount: (price.unit_amount ?? 0) / 100,
  amountDecimal: `${(price.unit_amount ?? 0) / 100}`
})