import { notEmpty, shuffleArray } from "@shared/utils";
import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    outfitIds: v.array(v.id('outfits'))
  },
  handler: async (ctx, { outfitIds }) => {
    const fromPresets = await Promise.all(outfitIds.map(async (outfitId) => {
      return ctx.db.query('presetGenerations')
        .withIndex('by_outfit_id', (q) => q.eq('outfitId', outfitId))
        .order('desc')
        .take(12);
    }));

    const generationIds = fromPresets.flat().map((p) => p.generationId);

    // Return all accepted predictions
    const predictions = await Promise.all(generationIds.map(async (generationId) => {
      const generation = await ctx.db.get(generationId);
      if (generation?.publication !== 'PUBLISHED') return null;
      const predictions = await ctx.db.query('predictions')
        .withIndex('by_generation_id', (q) => q.eq('generationId', generationId))
        .collect();
      return predictions.filter((p) => p.status === 'ACCEPTED');
    }));

    const seed = outfitIds.join('-');

    return shuffleArray(predictions.flat()
      .filter(notEmpty)
      .filter((p) => p.imageId !== null)
      .map((p) => ({
        _id: p._id,
        generationId: p.generationId,
        _creationTime: p._creationTime,
        imageId: p.imageId!,
        readyAt: p.readyAt,
      })), seed)
  }
})