import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { internalAction, internalMutation } from "../../../_generated/server";
import { PRESET_CATEGORIES, PRESET_PROMPT } from "../../../schema/presets";

export const _internal = internalAction({
  args: {
    presetId: v.id('presets'),
  },
  handler: async (ctx, { presetId }) => {
    const preset = await ctx.runQuery(internal.router.presets.getOne._internal, { presetId });
    if (!preset) throw new Error("Preset not found");

    const images = preset.imageIds;
    const prompts = await Promise.all(images.map((img) => ctx.runAction(internal.llm.triggers.presetCreator._internal, {
      imageId: img
    })))

    await ctx.runMutation(internal.router.admin.presets.repairOne._internal_mutation, {
      presetId,
      prompts: prompts.map((p) => p.prompt),
      categories: prompts.flatMap(p => p.categories).map((c) => ({ name: c.name, score: c.confidence })),
    })
  }
})

export const _internal_mutation = internalMutation({
  args: {
    presetId: v.id('presets'),
    prompts: v.array(PRESET_PROMPT),
    categories: v.array(v.object({
      name: PRESET_CATEGORIES,
      score: v.number()
    })),
  },
  handler: async (ctx, { presetId, prompts, categories }) => {
    const existingCategories = await ctx.db.query("presetCategories")
      .withIndex("by_preset_id", q => q.eq("presetId", presetId))
      .collect();

    await ctx.db.patch(presetId, { prompts });

    const existingCategoryNames = new Set(existingCategories.map(c => c.name));
    const newCategories = categories.filter(c => !existingCategoryNames.has(c.name)).map(c => ({
      presetId,
      name: c.name,
      score: c.score,
    }));

    await Promise.all(newCategories.map(c => ctx.db.insert("presetCategories", c)));
  }
})