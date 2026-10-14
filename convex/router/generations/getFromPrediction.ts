import { v } from "convex/values";
import { authQuery, internalQuery, publicQuery, userCheck } from "../../procedures";
import { canReadDrafts, getGenerationMax, publicPredictions } from "../../functions/generations";

export const _internal = internalQuery({
  args: {
    id: v.id("predictions"),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.id);
    if (!prediction?.generationId) return null;

    const generation = await getGenerationMax(ctx, prediction.generationId);
    if (!generation) return null;

    return generation;
  }
})

export const authed = authQuery({
  args: {
    id: v.id("predictions"),
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.id);
    if (!prediction?.generationId) return null;

    const generation = await getGenerationMax(ctx, prediction.generationId);
    if (!generation) return null;

    if (generation.userId !== ctx.userId) return null;

    return generation;
  }
})

export const anon = publicQuery({
  args: {
    id: v.id("predictions")
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.id);
    if (!prediction?.generationId) return null;

    const generation = await getGenerationMax(ctx, prediction.generationId);
    if (!generation) return null;

    // Share links resolve here without sign-in: unpublished predictions are owner/admin only.
    const predictions = canReadDrafts(await userCheck(ctx), generation)
      ? generation.predictions.filter((p) => p.status === 'ACCEPTED')
      : publicPredictions(generation, generation.predictions);
    if (predictions.length === 0) return null;

    const firstPredictionId = predictions[0]._id;
    const coverId = predictions[0].imageId;

    return {
      ...generation,
      predictions,
      firstPredictionId,
      coverId,
    }
  }
})