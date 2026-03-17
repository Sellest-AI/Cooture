import { v } from "convex/values";
import { grantCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";
import { TRANSACTION_TYPE } from "../../schema/wallets";

export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    type: v.optional(TRANSACTION_TYPE),
    metadata: v.optional(v.object({
      reason: v.string(),
      adminId: v.optional(v.id("users")),
    })),
  },
  handler: async (ctx, args) => {
    const { userId, amount, type } = args;
    const fallbackType = args.metadata?.adminId ? "ADMIN_GRANT" : "SYSTEM_GRANT";

    // Grant credits to the user
    await grantCredits(ctx, {
      userId,
      amount,
      type: type || fallbackType,
      metadata: args.metadata,
    });
  }
})