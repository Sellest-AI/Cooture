import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    predictionIds: v.array(v.string()),
    preset: v.optional(v.object({
      presetId: v.id("presets"),
      outfitId: v.optional(v.id("outfits")),
      prompts: v.array(v.string()),
    })),
  },
  handler: async (ctx, { predictionIds, preset }) => {
    const { userId } = ctx;

    const generationId = await ctx.db.insert("generations", {
      userId,
      status: "LOADING",
    });

    await Promise.all(predictionIds.map(predictionId => ctx.db.insert('predictions', {
      predictionId,
      generationId,
      status: 'LOADING',
    })));

    if (preset) {
      await ctx.db.insert("presetGenerations", {
        presetId: preset.presetId,
        generationId,
        outfitId: preset.outfitId,
        prompts: preset.prompts,
      });
    }

    return generationId;
  }
})