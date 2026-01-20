import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

/**
 * This mutation cancels all active subscriptions for a user.
 */
export const _internal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // get all running subscriptions for the user
    const subscriptions = await ctx.db.query("subscriptions")
      .withIndex('by_user_id_and_active', (q) => q.eq('userId', userId).eq('isActive', true))
      .collect();

    // cancel all subscriptions
    await Promise.all(subscriptions.map(subscription => ctx.db.patch(subscription._id, {
      status: "ENDED",
      isActive: false,
    })));
  }
})