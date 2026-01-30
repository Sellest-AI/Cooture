import { removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { internalMutation, MutationCtx } from "../../procedures";
import { PREDICTION_STATUS } from "../../schema/generations";

const updateGenerationStatus = async (ctx: MutationCtx, generationId: Id<'generations'>) => {
  const generation = await ctx.db.get(generationId);
  if (!generation) return;
  if (generation.status === "COMPLETED") return;

  // Check if all predictions are completed
  const predictions = await ctx.db.query("predictions").withIndex("by_generation_id", (q) =>
    q.eq("generationId", generationId)).collect();

  const COMPLETED_STATUSES = ["ACCEPTED", "REJECTED", "FAILED"];
  const allCompleted = predictions.every(prediction => COMPLETED_STATUSES.includes(prediction.status));

  if (allCompleted)
    return ctx.db.patch(generationId, { status: "COMPLETED", completedAt: Date.now() });

  const hasLoading = predictions.some(prediction => prediction.status === "LOADING");
  if (hasLoading) return ctx.db.patch(generationId, { status: "LOADING" });

  return ctx.db.patch(generationId, { status: "PENDING" });
}

export const _internal = internalMutation({
  args: {
    predictionId: v.string(),
    status: v.optional(PREDICTION_STATUS),
    imageId: v.optional(v.id("images")),
  },
  handler: async (ctx, args) => {
    const { predictionId, imageId } = args;

    const prediction = await ctx.db.query("predictions").withIndex("by_prediction_id", (q) =>
      q.eq("predictionId", predictionId)).first();

    if (!prediction) { throw new Error(`Prediction with id ${predictionId} not found`); }

    const status = args.status ?? (imageId ? "PENDING" : undefined);
    const readyAt = prediction.readyAt ?? (imageId ? Date.now() : undefined);

    const patch = removeUndefinedKeys({
      status,
      imageId,
      readyAt
    });

    await ctx.db.patch(prediction._id, patch);

    if (prediction.generationId)
      await updateGenerationStatus(ctx, prediction.generationId);

    return true;
  }
})