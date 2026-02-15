import { v } from "convex/values";
import { getGenerationMax } from "../../functions/generations";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    generationId: v.id("generations"),
  },
  handler: async (ctx, { generationId }) => {
    const generation = await getGenerationMax(ctx, generationId);
    if (!generation) return null;

    return generation;
  }
})

export const anon = authQuery({
  args: {
    id: v.id("generations"),
  },
  handler: async (ctx, { id }) => {
    const generation = await getGenerationMax(ctx, id);
    if (!generation) return null;

    const predictions = generation.predictions.filter((p) => p.status === 'ACCEPTED');
    if (predictions.length === 0) return null;

    return {
      ...generation,
      predictions,
    }
  }
})