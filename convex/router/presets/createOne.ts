import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { adminAction, internalMutation } from "../../procedures";
import { PRESET_CATEGORIES, PRESET_PROMPT } from "../../schema/presets";

export const admin = adminAction({
  args: {
    name: v.string(),
    base64: v.string(),
  },
  handler: async (ctx, { name, base64 }): Promise<void> => {
    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64 }],
      userId: null
    })

    const promptPromises = Promise.all(images.map((img) => ctx.runAction(internal.llm.triggers.presetCreator._internal, {
      userId: ctx.userId,
      imageId: img._id
    })))

    const depthMapPromises = Promise.all(images.map((img) => ctx.runAction(internal.llm.triggers.generateDepthMap._internal, {
      url: img.url,
      userId: null,
    })))

    try {
      const [prompts, depthMaps] = await Promise.all([
        promptPromises,
        depthMapPromises
      ]);

      // Filter to only high-confidence categories
      const allCategories = prompts.flatMap(p => p.categories);
      const highConfidenceCategories = allCategories.filter(cat => cat.confidence >= 0.7);
      const uniqueCategories = Array.from(new Set(highConfidenceCategories.map(cat => cat.name)));

      await ctx.runMutation(internal.router.presets.createOne._internal_mutation, {
        name,
        imageIds: images.map((img) => img._id),
        depthMaps: depthMaps.map((dm) => dm),
        prompts: prompts.map((p) => p.prompt),
        categories: uniqueCategories,
      })

    } catch {
      // Cleanup uploaded image on failure
      for (const img of images) {
        await ctx.scheduler.runAfter(10000,
          internal.router.storage.images.deleteOne._internal, { imageId: img._id });
      }
    }
  }
})

export const _internal_mutation = internalMutation({
  args: {
    name: v.string(),
    imageIds: v.array(v.id("images")),
    depthMaps: v.array(v.id("images")),
    prompts: v.array(PRESET_PROMPT),
    categories: v.array(PRESET_CATEGORIES),
  },
  handler: async (ctx, { name, imageIds, depthMaps, prompts, categories }) => {
    const presetId = await ctx.db.insert("presets", {
      name,
      imageIds,
      depthMaps,
      prompts,
      archived: false,
    })

    const uniqueCategories = Array.from(new Set(categories));
    for (const category of uniqueCategories) {
      await ctx.db.insert("presetCategories", { presetId, name: category })
    }

    return presetId;
  }
})