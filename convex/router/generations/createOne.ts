import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { createPrediction } from "../../functions/generations";
import { saveNotification } from "../../functions/notifications";
import { updateQuest } from "../../functions/quests";
import { internalMutation, MutationCtx } from "../../procedures";

const questHandler = async (ctx: MutationCtx, { userId, presetId, currentGenerationId }: { userId: Id<'users'>, presetId: Id<'presets'>, currentGenerationId: Id<'generations'> }) => {
  const generations = await ctx.db.query("generations").withIndex("by_user_id", (q) => q.eq("userId", userId)).collect();
  const pastGenerations = generations.filter((g) => g._id !== currentGenerationId);

  const presets = await Promise.all(pastGenerations.map((generation) => ctx.db.query("presetGenerations").withIndex("by_generation_id", (q) => q.eq("generationId", generation._id)).first()));
  const isNewPreset = !presets.some((preset) => preset?.presetId === presetId);
  if (isNewPreset) await updateQuest(ctx, { userId, questType: "presets_used", increment: 1 });
}

export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    extraUserIds: v.optional(v.array(v.id("users"))),
    predictions: v.array(v.object({
      id: v.string(),
      baseImageId: v.optional(v.id("images")),
    })),
    preset: v.optional(v.object({
      presetId: v.id("presets"),
      outfitId: v.optional(v.id("outfits")),
      prompts: v.array(v.string()),
    })),
  },
  handler: async (ctx, { userId, extraUserIds, predictions, preset }): Promise<Id<'generations'>> => {
    const generationId = await ctx.db.insert("generations", {
      userId,
      status: "LOADING",
      publication: "DRAFT",
    });

    await Promise.all(predictions.map(prediction => createPrediction(ctx, {
      predictionId: prediction.id,
      imageId: prediction.baseImageId,
      generationId,
      status: 'LOADING',
    })));

    const userIds = Array.from(new Set([userId, ...(extraUserIds ?? [])]));
    const extraUsers = (extraUserIds ?? []).filter((id) => id !== userId);

    // Send notifications
    await Promise.all(extraUsers.map((id) => saveNotification(ctx, {
      userId: id,
      actorId: userId,
      type: "tagged_in_generation",
      generationId,
      pushToDevice: true,
      // Delay the notification by 3 minutes to wait for the generation to be completed
      delayPushMs: 3 * 60 * 1000,
    })));

    if (preset?.outfitId)
      await saveNotification(ctx, {
        actorId: userId,
        outfitId: preset.outfitId,
        type: "outfit_used",
        pushToDevice: true,
        // Delay the notification by 5 minutes to wait for the generation to be completed
        delayPushMs: 5 * 60 * 1000,
      })

    if (preset?.presetId)
      await saveNotification(ctx, {
        actorId: userId,
        presetId: preset.presetId,
        type: "preset_used",
        pushToDevice: true,
        // Delay the notification by 5 minutes to wait for the generation to be completed
        delayPushMs: 5 * 60 * 1000,
      })

    if (preset) {
      await ctx.db.insert("presetGenerations", {
        presetId: preset.presetId,
        generationId,
        outfitId: preset.outfitId,
        prompts: preset.prompts,
        userIds,
      });

      // Update quests
      await questHandler(ctx, { userId, presetId: preset.presetId, currentGenerationId: generationId });
    }

    return generationId;
  }
})