import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { internalMutation } from "../../procedures";

export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    extraUserIds: v.optional(v.array(v.id("users"))),
    predictionIds: v.array(v.string()),
    preset: v.optional(v.object({
      presetId: v.id("presets"),
      outfitId: v.optional(v.id("outfits")),
      prompts: v.array(v.string()),
    })),
  },
  handler: async (ctx, { userId, extraUserIds, predictionIds, preset }): Promise<Id<'generations'>> => {
    const generationId = await ctx.db.insert("generations", {
      userId,
      status: "LOADING",
      publication: "DRAFT",
    });

    await Promise.all(predictionIds.map(predictionId => ctx.db.insert('predictions', {
      predictionId,
      generationId,
      status: 'LOADING',
    })));

    const userIds = Array.from(new Set([userId, ...(extraUserIds ?? [])]));

    if (preset) {
      await ctx.db.insert("presetGenerations", {
        presetId: preset.presetId,
        generationId,
        outfitId: preset.outfitId,
        prompts: preset.prompts,
        userIds,
      });
    }

    return generationId;
  }
})