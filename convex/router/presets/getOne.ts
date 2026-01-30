import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    presetId: v.id("presets"),
  },
  handler: async (ctx, { presetId }) => {
    const preset = await ctx.db.get(presetId);
    if (!preset) return null;

    const { prompts, ...rest } = preset;

    // Sanitize preset by removing prompts
    return {
      ...rest,
      expectedResults: prompts.length,
    };
  }
})