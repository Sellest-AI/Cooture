import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { adminAction, internalMutation } from "../../procedures";
import { CONTENT_RATINGS, CONTENT_RATINGS_ORDER } from "../../schema/constants";
import { PRESET_CATEGORIES, PRESET_PROMPT } from "../../schema/presets";

export const admin = adminAction({
  args: {
    name: v.string(),
    base64: v.string(),
  },
  handler: async (ctx, { name, base64 }): Promise<Id<'presets'> | null> => {
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

      // Sort from most to least restrictive and take the most restrictive one as the preset content rating
      const contentRating = prompts.map((x) => x.contentRating).sort((a, b) => CONTENT_RATINGS_ORDER[b] - CONTENT_RATINGS_ORDER[a])[0];

      const presetId = await ctx.runMutation(internal.router.presets.createOne._internal_mutation, {
        name,
        imageIds: images.map((img) => img._id),
        depthMaps: depthMaps.map((dm) => dm),
        prompts: prompts.map((p) => p.prompt),
        categories: prompts.flatMap((p) => p.categories),
        contentRating: contentRating,
      })

      return presetId;

    } catch {
      // Cleanup uploaded image on failure
      for (const img of images) {
        await ctx.scheduler.runAfter(10000,
          internal.router.storage.images.deleteOne._internal, { imageId: img._id });
      }

      // Cleanup generated depth maps on failure
      for (const dm of await depthMapPromises) {
        await ctx.scheduler.runAfter(10000,
          internal.router.storage.images.deleteOne._internal, { imageId: dm });
      }

      return null;
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
    contentRating: CONTENT_RATINGS,
  },
  handler: async (ctx, { name, imageIds, depthMaps, prompts, categories, contentRating }) => {
    const presetId = await ctx.db.insert("presets", {
      name,
      imageIds,
      depthMaps,
      prompts,
      contentRating,
      archived: false,
    })

    const uniqueCategories = Array.from(new Set(categories));
    for (const category of uniqueCategories) {
      await ctx.db.insert("presetCategories", { presetId, name: category })
    }

    return presetId;
  }
})