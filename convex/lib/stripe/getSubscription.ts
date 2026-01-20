import { stripe } from "./stripe.config";
import { sanitizePrice } from "./utils";

export const getStripeSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product']
    });

    const currentPeriodStartAt = subscription.items.data.sort((a, b) => a.current_period_start - b.current_period_start)[0].current_period_start;
    const currentPeriodEndAt = subscription.items.data.sort((a, b) => a.current_period_end - b.current_period_end)[0].current_period_end;
    const price = subscription.items.data[0].price;
    const priceId = price.id;
    const product = price.product;
    const productId = typeof product === "string" ? product : product.id;
    const recurring = price.recurring;

    const stripeProduct = await stripe.products.retrieve(productId);

    const metadata = {
      ...stripeProduct.metadata,
      product_id: stripeProduct.metadata.product_id,
      productId: stripeProduct.metadata.product_id,
      credits: stripeProduct.metadata.credits,
      tokens: stripeProduct.metadata.tokens,
    }

    return {
      ...subscription,
      current_period_start: currentPeriodStartAt,
      current_period_end: currentPeriodEndAt,
      price_id: priceId,
      product_id: productId,
      product: { ...stripeProduct, metadata },
      price: sanitizePrice(price),
      recurring,
    };
  } catch {
    return null;
  }
}