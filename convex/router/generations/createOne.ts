import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { saveNotification } from "../../functions/notifications";
import { updateQuest } from "../../functions/quests";
import { internalMutation, MutationCtx } from "../../procedures";

const questHandler = async (ctx: MutationCtx, { userId, presetId }: { userId: Id<'users'>, presetId: Id<'presets'> }) => {
  const generations = await ctx.db.query("generations").withIndex("by_user_id", (q) => q.eq("userId", userId)).collect();
  const presets = await Promise.all(generations.map((generation) => ctx.db.query("presetGenerations").withIndex("by_generation_id", (q) => q.eq("generationId", generation._id)).first()));
  const isNewPreset = !presets.some((preset) => preset?.presetId === presetId);
  if (isNewPreset) await updateQuest(ctx, { userId, questType: "presets_used", increment: 1 });
}

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
    const extraUsers = (extraUserIds ?? []).filter((id) => id !== userId);

    await Promise.all(extraUsers.map((id) => saveNotification(ctx, {
      userId: id,
      actorId: userId,
      type: "tagged_in_generation",
      generationId,
      pushToDevice: true
    })));

    if (preset) {
      await ctx.db.insert("presetGenerations", {
        presetId: preset.presetId,
        generationId,
        outfitId: preset.outfitId,
        prompts: preset.prompts,
        userIds,
      });

      // Update quests
      await questHandler(ctx, { userId, presetId: preset.presetId });
    }

    return generationId;
  }
})