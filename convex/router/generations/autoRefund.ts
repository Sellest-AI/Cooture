import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { CREDITS_CONFIG, grantCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";

/**
 * This will auto refund the user if the task takes too much time to complete,
 * Or if the prediction failed
 */
export const _internal = internalMutation({
  args: {
    predictionId: v.id("predictions"),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.predictionId);
    if (!prediction) return;

    // If it has already moved to REVIEW, ACCEPTED, or REJECTED, we shouldn't refund.
    if (prediction.status !== "FAILED" && prediction.status !== "LOADING") return;

    // Mark prediction as failed to unblock the user and avoid a bad UX.
    if (prediction.status === "LOADING")
      await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
        predictionId: prediction.predictionId,
        status: "FAILED"
      });

    if (!prediction?.generationId) return;
    const generation = await ctx.db.get(prediction.generationId);
    if (!generation) return;

    // Find original transaction (getting most recent first)
    const transactions = await ctx.db.query("creditTransactions")
      .withIndex("by_from_id", (q) => q.eq('fromId', generation.userId))
      .order("desc")
      .take(512);

    const originalTransaction = transactions
      .filter((t) => t.type === 'GENERATION_COST')
      .find((t) => t.metadata?.generationId === prediction.generationId);

    // If has baseImageId, it's a video generation, otherwise it's an image generation
    const amountToRefund = prediction.imageId ?
      CREDITS_CONFIG.COST_PER_VIDEO_GENERATION :
      CREDITS_CONFIG.COST_PER_IMAGE_GENERATION;

    // If we can't find the original transaction it means no payment was registered for this generation, 
    // so we shouldn't refund.
    if (!originalTransaction) return;

    // Refund the user
    await grantCredits(ctx, {
      userId: generation.userId,
      amount: amountToRefund,
      type: "REFUND",
      metadata: {
        reason: "Auto refund for generation that took too long to complete",
        refund: originalTransaction?._id ? {
          originalTransactionId: originalTransaction._id
        } : undefined
      }
    });
  }
});
