import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    outfitId: v.id('outfits')
  },
  handler: async (ctx, { outfitId }) => {
    const fromPresets = await ctx.db.query('presetGenerations')
      .withIndex('by_outfit_id', (q) => q.eq('outfitId', outfitId))
      .order('desc')
      .take(20);

    const generationIds = fromPresets.map((p) => p.generationId);

    // Return all accepted predictions
    const predictions = await Promise.all(generationIds.map(async (generationId) => {
      const _predictions = await ctx.db.query('predictions')
        .withIndex('by_generation_id', (q) => q.eq('generationId', generationId))
        .collect();
      const filtered = _predictions.filter((p) => p.status === 'ACCEPTED');
      if (filtered.length === 0) return null;
      return filtered;
    }));

    return predictions.flat()
      .filter(notEmpty)
      .filter((p) => p.imageId !== null)
      .map((p) => ({
        _id: p._id,
        generationId: p.generationId,
        _creationTime: p._creationTime,
        imageId: p.imageId!,
        readyAt: p.readyAt,
      }))
  }
})