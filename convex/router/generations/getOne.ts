import { v } from "convex/values";
import { canReadDrafts, getGenerationMax, publicPredictions } from "../../functions/generations";
import { adminQuery, authQuery } from "../../procedures";

/** Full generation, every prediction included — owner only (photoshoot review, notifications). */
export const authed = authQuery({
  args: { generationId: v.id("generations") },
  handler: async (ctx, { generationId }) => {
    const generation = await getGenerationMax(ctx, generationId);
    if (!generation || !canReadDrafts(ctx, generation)) return null;
    return generation;
  }
})

export const admin = adminQuery({
  args: { generationId: v.id("generations") },
  handler: async (ctx, { generationId }) => getGenerationMax(ctx, generationId)
})

/** A post as others see it: only accepted predictions that were part of a published version. */
export const anon = authQuery({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, { id }) => {
    const generation = await getGenerationMax(ctx, id);
    if (!generation) return null;

    const predictions = canReadDrafts(ctx, generation)
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
