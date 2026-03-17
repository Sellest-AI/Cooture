import { v } from "convex/values";
import { internal } from "../_generated/api";
import { httpAction, MutationCtx } from "../_generated/server";
import { env } from "../env";
import { getUserWallet } from "../functions/credits";
import { CREDITS_CONFIG } from "../functions/credits/credits.config";
import { internalMutation } from "../procedures";

export const revenueCatHandler = httpAction(async (ctx, request) => {
  const authorization = request.headers.get("authorization");

  // You should configure this secret in the Convex dashboard and RevenueCat dashboard
  const webhookSecret = env.REVENUECAT_WEBHOOK_SECRET;

  if (webhookSecret && authorization !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const event = body?.event;

  if (!event) {
    return new Response("No event found", { status: 400 });
  }

  try {
    await ctx.runMutation(internal.http.revenuecat.processWebhook, { event });
    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("Error processing RC webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

const extractUser = async (ctx: MutationCtx, event: any) => {
  const appUserId = event.app_user_id; // Normally the Convex userId, if linked
  const originalAppUserId = event.original_app_user_id;

  // Find the user's extended record
  let user = await ctx.db
    .query("usersExtended")
    .withIndex("by_user_id", (q) => q.eq("userId", appUserId as any))
    .first();

  if (!user) {
    // Fallback: Check if we've seen this original_app_user_id before
    user = await ctx.db
      .query("usersExtended")
      .withIndex("by_revenuecat_user_id", (q) => q.eq("revenueCatUserId", originalAppUserId))
      .first();
  }

  if (!user) {
    console.log(`User not found for RevenueCat webhook: ${appUserId}`);
    return;
  }

  // Save revenueCatUserId if not already saved to track future offline renewals securely
  if (user.revenueCatUserId !== originalAppUserId) {
    await ctx.db.patch(user._id, { revenueCatUserId: originalAppUserId });
  }

  return user;
}

export const processWebhook = internalMutation({
  args: { event: v.any() },
  handler: async (ctx, args) => {
    const { event } = args;

    // RevenueCat event payload docs: https://www.revenuecat.com/docs/webhooks
    const type = event.type; // INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, etc.
    const productId: string = event.product_id;
    const entitlementIds: string[] = event.entitlement_ids || [];


    const user = await extractUser(ctx, event);
    if (!user) return; // If we can't find the user, we can't process the event

    // Process Purchases & Renewals
    if (type === "INITIAL_PURCHASE" || type === "RENEWAL") {
      // Determine the interval from the product_id
      let renewalInterval: "weekly" | "monthly" | "yearly" = "monthly";
      const lowerProductId = productId.toLowerCase();

      if (lowerProductId.includes("week") || event.period_type === "WEEKLY") renewalInterval = "weekly";
      else if (lowerProductId.includes("month") || event.period_type === "MONTHLY") renewalInterval = "monthly";
      else if (lowerProductId.includes("year") || event.period_type === "YEARLY") renewalInterval = "yearly";

      let multiplier = 1;
      if (renewalInterval === "monthly") multiplier = 4;
      if (renewalInterval === "yearly") multiplier = 52;

      const creditsToAdd = CREDITS_CONFIG.COOTURE_PLUS_CREDITS * multiplier;
      const finalProductId = `COOTURE_PLUS_${renewalInterval.toUpperCase().replaceAll(' ', '_')}`;

      // Update the user's plan
      const planId = entitlementIds.length > 0 ? entitlementIds[0] : "COOTURE_PLUS";
      await ctx.db.patch(user._id, { plan: { id: planId, renewalInterval } });

      // Add credits
      const wallet = await getUserWallet(ctx, user.userId);

      if (wallet) {
        const newBalance = wallet.credits + creditsToAdd;
        await ctx.db.patch(wallet._id, { credits: newBalance });

        await ctx.db.insert("creditTransactions", {
          fromId: "system",
          toId: user.userId,
          type: "SUBSCRIPTION_BONUS",
          amount: creditsToAdd,
          balanceAfter: newBalance,
          metadata: { reason: `RevenueCat ${type} for ${finalProductId}` },
        });
      }
    }
    // Process Expirations
    else if (type === "EXPIRATION") {
      // Note: "CANCELLATION" just means auto-renew is off. RevenueCat 
      // highly recommends removing entitlements ONLY on "EXPIRATION".
      await ctx.db.patch(user._id, {
        plan: undefined
      });
    }
  },
});
