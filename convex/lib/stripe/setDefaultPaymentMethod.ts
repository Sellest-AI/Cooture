import { stripe } from "./stripe.config";

export const setDefaultPaymentMethodFromSubscription = async (subscriptionId: string) => {
  // Retrieve the subscription to get the payment method
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  const defaultPaymentMethod = subscription.default_payment_method as { id: string } | string;
  const defaultPaymentMethodId = typeof defaultPaymentMethod === "object" ? defaultPaymentMethod.id : defaultPaymentMethod;
  const customerId = subscription.customer as string;

  if (defaultPaymentMethodId) {
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: defaultPaymentMethodId,
      },
    });
  }

  return null;
};