import { v } from "convex/values";
import z from "zod";
import { internal } from "../_generated/api";
import { MutationCtx } from "../_generated/server";
import { env } from "../env";
import { getUserWallet } from "../functions/credits";
import { CREDITS_CONFIG } from "../functions/credits/credits.config";
import { constantTimeEqual } from "../lib/crypto";
import { internalMutation } from "../procedures";
import { verifiedWebhook } from "./verified";

const eventSchema = z.object({
  type: z.string(),
  product_id: z.string(),
  entitlement_ids: z.array(z.string()).nullish().transform((ids) => ids ?? []),
  period_type: z.string().optional(),
  app_user_id: z.string(),
  original_app_user_id: z.string().optional(),
});

const eventArgs = v.object({
  type: v.string(),
  product_id: v.string(),
  entitlement_ids: v.array(v.string()),
  period_type: v.optional(v.string()),
  app_user_id: v.string(),
  original_app_user_id: v.optional(v.string()),
})

/**
 * This handler grants entitlements and mints credits, so an unauthenticated caller could
 * hand themselves a premium account. The check used to be `if (webhookSecret && …)`, which
 * a missing REVENUECAT_WEBHOOK_SECRET turned into no check at all (03-FLAWS F3).
 *
 * It is now unconditional and constant-time: reading the secret throws when unset, and the
 * wrapper answers 401.
 */
export const revenueCatHandler = verifiedWebhook({
  verify: (request) => {
    const authorization = request.headers.get("authorization") ?? "";
    if (!constantTimeEqual(authorization, env.REVENUECAT_WEBHOOK_SECRET))
      throw new Error("Invalid RevenueCat webhook secret");
  },
  parse: (json) => (json as { event?: unknown })?.event,
  handle: async (ctx, event) => {
    if (!event) return new Response("No event found", { status: 400 });

    const parsed = eventSchema.safeParse(event);
    if (!parsed.success) {
      console.error("Malformed RC webhook event:", parsed.error.message);
      return new Response("Bad Request", { status: 400 });
    }

    try {
      await ctx.runMutation(internal.http.revenuecat.processWebhook, { event: parsed.data });
      return new Response("Success", { status: 200 });
    } catch (error) {
      console.error("Error processing RC webhook:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
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
  args: { event: eventArgs },
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

      // Delete any existing cancellation job since the subscription is active again
      if (user.plan?.cancelFunctionId) await ctx.scheduler.cancel(user.plan.cancelFunctionId);

      // Update the user's plan
      const planId = entitlementIds.length > 0 ? entitlementIds[0] : "COOTURE_PLUS";
      await ctx.db.patch(user._id, {
        plan: {
          id: planId,
          renewalInterval,
          cancelFunctionId: undefined
        }
      });

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
      if (user.plan?.cancelFunctionId) await ctx.scheduler.cancel(user.plan.cancelFunctionId);
      // Note: "CANCELLATION" just means auto-renew is off. RevenueCat 
      // highly recommends removing entitlements ONLY on "EXPIRATION".
      await ctx.db.patch(user._id, {
        plan: undefined,
      });
    }
  },
});
