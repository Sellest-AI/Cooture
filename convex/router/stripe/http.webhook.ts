import { env } from "../../env";
import { ActionCtx, httpAction } from "../../_generated/server";
import { getStripeSubscription, stripe, stripeDateToNumber, stripeStatusToServerStatus } from "../../lib/stripe";
import type Stripe from "stripe";
import { setDefaultPaymentMethodFromSubscription } from "@/lib/stripe";
import { internal } from "../../_generated/api";

//  stripe listen --forward-to localhost:3000/api/webhooks/stripe
//  stripe listen --forward-to [CONVEX ENDPOINT].site/api/webhooks/stripe

const retrieveEventFromRequest = async (req: Request) => {
  if (!req.body) return null;

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const endpointSecret = env.STRIPE_WEBHOOK_SECRETS.split(',');

  if (!sig || !body) return null;

  let event: Stripe.Event | null = null;

  for (const secret of endpointSecret) {
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, secret);

      if (event) break;
    } catch { }
  }

  return event;
}

const handleEvent = async (event: Stripe.Event, ctx: ActionCtx) => {
  const createStripeSubscription = async (stripeSubscriptionId: string, stripeUserId: string) => {
    const subscriptionCreated = await getStripeSubscription(stripeSubscriptionId);
    if (!subscriptionCreated) return;

    const user = await ctx.runQuery(internal.router.users.getFromStripeId._internal, { stripeCustomerId: stripeUserId });

    // if is a yearly subscription, set the internalRenewAt to the next month
    const internalRenewAt = subscriptionCreated.recurring?.interval === "year" ? new Date(stripeDateToNumber(subscriptionCreated.current_period_start)) : undefined;
    internalRenewAt?.setMonth(internalRenewAt.getMonth() + 1);

    await ctx.runAction(internal.router.stripe.createDbSubscription.action, {
      userId: user._id,
      stripeSubscriptionId: stripeSubscriptionId,
      internalRenewAt: internalRenewAt?.getTime() ?? undefined,
    })
  }

  // TODO: Link to internal action to uncache products
  // This makes sure that products are always up to date
  const uncacheProducts = () => null;
  // const uncacheProducts = () => ctx.runAction(internal.router.stripe.getProducts.uncache, {})

  const cancelStripeSubscription = async (stripeSubscriptionId: string) =>
    ctx.runAction(internal.router.stripe.cancelDbSubscription.action, {
      stripeSubscriptionId: stripeSubscriptionId,
    }).catch(() => false)

  const updateStripeSubscription = async (stripeSubscriptionId: string, status: Stripe.Subscription.Status) =>
    ctx.runMutation(internal.router.subscriptions.updateSubscriptionStatus._internal, {
      stripeSubscriptionId: stripeSubscriptionId,
      status: stripeStatusToServerStatus(status),
    }).catch(() => false)

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const checkoutSubscription = session.subscription as string;

      await setDefaultPaymentMethodFromSubscription(checkoutSubscription)

      // the payment (createSubscription) will be handled by invoice.payment_succeeded

      // await createSubscription({
      //   userId: stripeCheckoutCustomerId,
      //   checkoutId: session.id,
      //   subscriptionId: checkoutSubscription,
      // })

      console.log(`Payment method was successful set for session: ${session.id}`);
      break;

    case "customer.subscription.created":
      const customerId = event.data.object.customer as string;
      const customerSubscriptionId = event.data.object.id;

      const status = event.data.object.status;
      if (!(status === "active" || status === "trialing" || status === "incomplete")) {
        // the subscription isn't completed (is not active or trialing)
        break;
      }

      await createStripeSubscription(customerSubscriptionId, customerId);

      console.log(`Customer subscription was created for customer: ${customerId}`);
      break;

    case "invoice.payment_succeeded":
      const invoicePayment = event.data.object;
      const stripeInvoiceCustomerId = invoicePayment?.customer as string;
      const invoiceSubscription = (invoicePayment as unknown as { subscription: string }).subscription;

      if (invoicePayment.billing_reason === 'subscription_create') {
        // it will be handled by customer.subscription.created
        break;
      }

      await createStripeSubscription(invoiceSubscription, stripeInvoiceCustomerId);

      console.log(`Invoice payment was successful for invoice: ${invoicePayment.id}`);
      break;

    case "invoice.paid":
      const invoice = event.data.object;
      console.log(`Invoice was paid for invoice: ${invoice.id}`, event.type);
      break;

    case "invoice.payment_failed":
      const failedInvoice = event.data.object;
      console.log(`Invoice payment failed for invoice: ${failedInvoice.id}`);
      break;

    case "customer.subscription.updated":
      const updatedSubscription = event.data.object;

      if (updatedSubscription.cancel_at_period_end || updatedSubscription.status === 'canceled') {
        await cancelStripeSubscription(updatedSubscription.id)
        console.log(`Subscription was canceled for subscription: ${updatedSubscription.id}`);
        break;
      }

      if (updatedSubscription.status === 'active' || updatedSubscription.status === 'trialing') {
        await updateStripeSubscription(updatedSubscription.id, updatedSubscription.status)
        console.log(`Subscription was resumed for subscription: ${updatedSubscription.id}`);
        break;
      }

      const result = await updateStripeSubscription(updatedSubscription.id, updatedSubscription.status);
      if (result) {
        console.log(`Subscription was updated for subscription: ${updatedSubscription.id}. Status: ${updatedSubscription.status}`);
        break;
      }

      console.log(`Subscription was not updated for subscription: ${updatedSubscription.id}`);
      break;

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;

      await cancelStripeSubscription(deletedSubscription.id)

      console.log(`Subscription was deleted for subscription: ${deletedSubscription.id}`);
      break;

    // UNCACHE PRODUCTS
    case "product.created":
      await uncacheProducts()
      break;
    case "product.updated":
      await uncacheProducts()
      break;
    case "product.deleted":
      await uncacheProducts()
      break;
    case "price.created":
      await uncacheProducts()
      break;
    case "price.updated":
      await uncacheProducts()
      break;
    case "price.deleted":
      await uncacheProducts()
      break;


    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}


export const stripeWebhookHttpAction = httpAction(async (ctx, request) => {
  const event = await retrieveEventFromRequest(request);
  if (!event) throw new Error("Invalid Stripe event");

  await handleEvent(event, ctx);

  return Response.json({ received: true }, { status: 200 });
})