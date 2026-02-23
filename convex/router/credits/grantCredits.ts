import { v } from "convex/values";
import { grantCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";

export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    metadata: v.optional(v.object({
      reason: v.string(),
      adminId: v.optional(v.id("users")),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, amount } = args;
    // Grant credits to the user
    await grantCredits(ctx, {
      userId,
      amount,
      type: "ADMIN_GRANT",
      metadata: args.metadata,
    });
  }
})