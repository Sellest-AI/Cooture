import { v } from "convex/values";
import { internalMutation } from "../../procedures";
import { SUBSCRIPTIONS, isSubscriptionActive, getUserSubscription } from "../../functions/subscriptions";
import { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";

const NEXT_RENEWAL_DATE = (data: Date) => {
  const date = new Date(data);
  date.setMonth(date.getMonth() + 1);
  return date;
}

const args = { userId: v.id("users") }

export const _internal = internalMutation({
  args, handler: async (ctx, { userId }): Promise<Id<'subscriptions'> | null> => {
    const startAt = new Date();
    const internalRenewAt = NEXT_RENEWAL_DATE(startAt);

    // Check if the user already has a subscription
    const currentSubscription = await getUserSubscription(ctx, userId);
    if (currentSubscription && isSubscriptionActive(currentSubscription)) return null;

    // Cancel any existing subscriptions
    await ctx.runMutation(internal.router.subscriptions.endOne._internal, { userId });

    const limits = SUBSCRIPTIONS.find((s) => s.name === "free");

    // Schedule the next renewal date
    const renewalId = await ctx.scheduler.runAt(internalRenewAt.getTime() + 1, internal.router.subscriptions.createFreeSubscription._internal, { userId })

    const subscription = await ctx.db.insert("subscriptions", {
      userId,
      status: "ACTIVE",
      startAt: startAt.getTime(),
      internalProductId: 'free',
      internalRenewAt: internalRenewAt.getTime(),
      renewalFunctionId: renewalId,
      isActive: true,
      usage: {
        tokensLimit: limits?.tokensAmount ?? 0,
        tokensUsed: 0,
        creditLimit: limits?.creditsAmount ?? 50,
        creditsUsed: 0,
      },
    });

    return subscription;
  }
})