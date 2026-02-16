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
  },
  handler: async (ctx, args) => {
    const result = await deductCredits(ctx, {
      userId: args.userId,
      amount: args.amount,
      type: "GENERATION_COST",
      metadata: args.generationId ? {
        generation: {
          generationId: args.generationId,
        },
      } : undefined,
    });

    return result;
  },
});
