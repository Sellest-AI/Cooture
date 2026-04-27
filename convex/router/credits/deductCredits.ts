import { v } from "convex/values";
import { deductCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";

/**
 * Internal mutation to deduct credits for a generation
 * Should be called before starting a generation to ensure user has credits
 */
export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    generationId: v.optional(v.id("generations")),
    itemId: v.optional(v.id("items")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await deductCredits(ctx, {
      userId: args.userId,
      amount: args.amount,
      type: args.generationId ? "GENERATION_COST" : "SYSTEM_DEDUCT",
      metadata: args.generationId ? {
        generationId: args.generationId,
        itemId: args.itemId,
        reason: args.reason,
      } : undefined,
    });

    return result;
  },
});
