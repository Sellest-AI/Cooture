import { removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";
import { upsertFeedScore } from "../../functions/feed";
import { readNotification, saveNotification } from "../../functions/notifications";
import { updateQuest } from "../../functions/quests";
import { isAuthorized } from "../../functions/users";
import { adminMutation, authMutation, internalMutation, MutationCtx } from "../../procedures";
import { PREDICTION_STATUS } from "../../schema/generations";

const updateGenerationStatus = async (ctx: MutationCtx, generationId: Id<'generations'>) => {
  const generation = await ctx.db.get(generationId);
  if (!generation) return;

  // Check if all predictions are completed
  const predictions = await ctx.db.query("predictions").withIndex("by_generation_id", (q) =>
    q.eq("generationId", generationId)).collect();

  const allRejected = predictions.every(prediction => ["REJECTED", "FAILED"].includes(prediction.status));
  const someAccepted = predictions.some(prediction => ["ACCEPTED"].includes(prediction.status));
  const allProcessed = predictions.every(prediction => ["ACCEPTED", "REJECTED", "FAILED"].includes(prediction.status));

  // Archive the feed score if all predictions are rejected, otherwise unarchive it
  if (allProcessed)
    await upsertFeedScore(ctx, { generationId: generation._id, archive: allRejected });

  // Get the latest readyAt timestamp among predictions to set as completedAt for the generation
  const completedAt = predictions.sort((a, b) => (b.readyAt ?? 0) - (a.readyAt ?? 0))[0]?.readyAt
    ?? generation.completedAt ?? Date.now();

  // Archive or publish the generation depending on the predictions status
  if (allProcessed) {
    if (allRejected && generation.publication === "ARCHIVED") return;
    if (someAccepted && generation.publication === "PUBLISHED") return;
    await readNotification(ctx, { userId: generation.userId, generationId, type: "generation_ready" });
    await ctx.db.patch(generationId, {
      status: "COMPLETED",
      completedAt: completedAt,
      publication: allRejected ? "ARCHIVED" : "PUBLISHED"
    });
    return;
  }

  const hasLoading = predictions.some(prediction => prediction.status === "LOADING");
  if (hasLoading) return ctx.db.patch(generationId, { status: "LOADING", publication: "DRAFT" });

  if (generation.status === "PENDING") return;

  await ctx.db.patch(generationId, { status: "PENDING", publication: "DRAFT" });

  // Update quests
  await updateQuest(ctx, {
    questType: "photos_generated",
    userId: generation.userId,
    increment: predictions.length,
  })

  // Only send a notification when the generation is waiting for human validation
  await saveNotification(ctx, {
    userId: generation.userId, actorId: generation.userId,
    type: "generation_ready", generationId,
    pushToDevice: true
  });
}

const updatePrediction = async (ctx: MutationCtx, args: {
  prediction: Doc<'predictions'>,
  status?: Doc<'predictions'>['status'],
  imageId?: Id<'images'>,
  videoId?: Id<'videos'>,
}) => {
  const { prediction, imageId, videoId } = args;

  const hasResult = !!imageId || !!videoId;

  const status = args.status ?? (hasResult ? "PENDING" : undefined);
  const readyAt = prediction.readyAt ?? (hasResult ? Date.now() : undefined);

  const patch = removeUndefinedKeys({
    status,
    imageId,
    videoId,
    readyAt
  });

  await ctx.db.patch(prediction._id, patch);

  if (prediction.generationId)
    await updateGenerationStatus(ctx, prediction.generationId);

  return true;
}

export const _internal = internalMutation({
  args: {
    predictionId: v.string(),
    status: v.optional(PREDICTION_STATUS),
    imageId: v.optional(v.id("images")),
    videoId: v.optional(v.id("videos")),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.query("predictions").withIndex("by_prediction_id", (q) =>
      q.eq("predictionId", args.predictionId)).first();

    if (!prediction) { throw new Error(`Prediction with id ${args.predictionId} not found`); }

    return updatePrediction(ctx, { ...args, prediction });
  }
})

export const authed = authMutation({
  args: {
    predictionId: v.string(),
    status: v.optional(v.union(v.literal('ACCEPTED'), v.literal('REJECTED'))),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.query("predictions").withIndex("by_prediction_id", (q) =>
      q.eq("predictionId", args.predictionId)).first();

    if (!prediction) { throw new Error(`Prediction with id ${args.predictionId} not found`); }

    await isAuthorized(ctx, prediction);

    return updatePrediction(ctx, { ...args, prediction });
  }
})

export const admin = adminMutation({
  args: {
    predictionId: v.string(),
    status: v.optional(v.union(v.literal('ACCEPTED'), v.literal('REJECTED'))),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.query("predictions").withIndex("by_prediction_id", (q) =>
      q.eq("predictionId", args.predictionId)).first();

    if (!prediction) { throw new Error(`Prediction with id ${args.predictionId} not found`); }

    return updatePrediction(ctx, { ...args, prediction });
  }
})