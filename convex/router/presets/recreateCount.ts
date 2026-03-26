import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    presetId: v.id("presets")
  },
  handler: async (ctx, { presetId }) => {
    const generations = await ctx.db.query("presetGenerations")
      .withIndex("by_preset_id", q => q.eq("presetId", presetId))
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