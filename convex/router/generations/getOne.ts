import { v } from "convex/values";
import { getPredictions } from "../../functions/generations";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    generationId: v.id("generations"),
  },
  handler: async (ctx, { generationId }) => {
    const [generation, predictions, metadata] = await Promise.all([
      ctx.db.get(generationId),
      getPredictions(ctx, generationId),
      ctx.db.query('presetGenerations')
        .withIndex('by_generation_id', q => q.eq('generationId', generationId)).collect()
    ]);

    if (!generation)
      throw new Error(`Generation with id ${generationId} not found`);

    return {
      ...generation,
      predictions,
      metadata,
    }
  }
})