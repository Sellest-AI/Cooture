import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    presetId: v.id('presets')
  },
  handler: async (ctx, { presetId }) => {
    const fromPresets = await ctx.db.query('presetGenerations')
      .withIndex('by_preset_id', (q) => q.eq('presetId', presetId))
      .order('desc')
      .take(48);

    const generationIds = fromPresets.map((p) => p.generationId);

    // Return all accepted predictions
    const predictions = await Promise.all(generationIds.map(async (generationId) => {
      const generation = await ctx.db.get('generations', generationId);
      if (generation?.publication !== 'PUBLISHED') return null;
      const predictions = await ctx.db.query('predictions')
        .withIndex('by_generation_id', (q) => q.eq('generationId', generationId))
        .collect();
      return predictions.filter((p) => p.status === 'ACCEPTED');
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