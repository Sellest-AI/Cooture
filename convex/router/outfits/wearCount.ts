import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, { outfitId }) => {
    const generations = await ctx.db.query("presetGenerations")
      .withIndex("by_outfit_id", q => q.eq("outfitId", outfitId))
      .collect();

    const predictions = await Promise.all(generations.map(async (g) => {
      const pred = await ctx.db.query("predictions")
        .withIndex("by_generation_id", q => q.eq("generationId", g.generationId))
        .collect();
      return pred.length;
    }))

    return predictions.reduce((acc, count) => acc + count, 0);
  }
})