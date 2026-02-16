import { v } from "convex/values";
import { grantCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";

/**
 * Internal mutation to refund credits for a failed generation
 */
export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    originalTransactionId: v.optional(v.id("creditTransactions")),
  },
  handler: async (ctx, args) => {
    const result = await grantCredits(ctx, {
      userId: args.userId,
      amount: args.amount,
      type: "REFUND",
      metadata: {
        reason: args.reason,
        refund: {
          originalTransactionId: args.originalTransactionId,
        },
      },
    });

    return result;
  },
});
