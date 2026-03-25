import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { CREDITS_CONFIG, canPay, deductCredits } from "../../functions/credits";
import { isPremium } from "../../functions/users";
import { imageCategorizer } from "../../llm/tools/imageCategorizer";
import { authAction, internalMutation, serverAction } from "../../procedures";
import { CONTENT_RATINGS, CONTENT_RATINGS_ORDER } from "../../schema/constants";
import { PRESET_CATEGORIES, PRESET_PROMPT } from "../../schema/presets";

export const authed = authAction({
  args: {
    name: v.string(),
    base64: v.string(),
  },
  handler: async (ctx, { name, base64 }): Promise<Id<'presets'> | null> => {
    await isPremium(ctx);
    await canPay(ctx, { type: "PRESET_CREATION_COST" });

    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64 }],
      userId: null
    })

    const promptPromises = Promise.all(images.map((img) => ctx.runAction(internal.llm.triggers.presetCreator._internal, {
      imageId: img._id,
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

      // Charge the user only after all processing is done to avoid charging for failed preset creations
      await ctx.runMutation(internal.router.presets.createOne._internal_payment, { userId: ctx.userId });

      if (contentRating === 'EXPLICIT' || contentRating === 'NSFW')
        throw new Error("Preset contains explicit or NSFW content");

      const presetId = await ctx.runMutation(internal.router.presets.createOne._internal_mutation, {
        name,
        imageIds: images.map((img) => img._id),
        depthMaps: depthMaps.map((dm) => dm),
        prompts: prompts.map((p) => p.prompt),
        categories: prompts.flatMap((p) => p.categories).map((c) => ({ name: c.name, score: c.confidence })),
        contentRating: contentRating,
        userId: ctx.userId,
        archived: true,
      })

      // Auto-delete preset if still unused after 1h to avoid cluttering the database with unused presets
      await ctx.scheduler.runAfter(1 * 60 * 60 * 1000, internal.router.presets.deleteOne._internal, {
        id: presetId,
        onlyIfArchived: true,
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

export const server = serverAction({
  args: {
    name: v.string(),
    imageBase64: v.string(),
    depthMapBase64: v.string(),
    contentRating: CONTENT_RATINGS,
    prompt: PRESET_PROMPT,
  },
  handler: async (ctx, args): Promise<Id<'presets'> | null> => {
    const covers = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64: args.imageBase64 }],
      userId: null
    })

    const depthMaps = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64: args.depthMapBase64 }],
      userId: null
    })

    try {
      const prompts = [args.prompt];

      const categories = await Promise.all(covers.map((img) =>
        imageCategorizer.handler(ctx, { imageUrl: img.url })));

      const presetId = await ctx.runMutation(internal.router.presets.createOne._internal_mutation, {
        name: args.name,
        imageIds: covers.map((img) => img._id),
        depthMaps: depthMaps.map((dm) => dm._id),
        prompts: prompts,
        categories: categories.flat().map((c) => ({ name: c.name, score: c.confidence })),
        contentRating: args.contentRating,
        archived: false,
      })

      return presetId;
    }
    catch {
      // Cleanup uploaded image on failure
      for (const img of covers) {
        await ctx.scheduler.runAfter(10000,
          internal.router.storage.images.deleteOne._internal, { imageId: img._id });
      }

      // Cleanup generated depth maps on failure
      for (const dm of await depthMaps) {
        await ctx.scheduler.runAfter(10000,
          internal.router.storage.images.deleteOne._internal, { imageId: dm._id });
      }

      return null;
    }
  }
})

export const _internal_payment = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    await deductCredits(ctx, {
      userId: userId,
      amount: CREDITS_CONFIG.COST_PER_PRESET,
      type: "PRESET_CREATION_COST",
    });
  }
});

export const _internal_mutation = internalMutation({
  args: {
    name: v.string(),
    userId: v.optional(v.id("users")),
    imageIds: v.array(v.id("images")),
    depthMaps: v.array(v.id("images")),
    prompts: v.array(PRESET_PROMPT),
    contentRating: CONTENT_RATINGS,
    archived: v.optional(v.boolean()),
    categories: v.array(v.object({
      name: PRESET_CATEGORIES,
      score: v.number(),
    })),
  },
  handler: async (ctx, { name, imageIds, depthMaps, prompts, categories, contentRating, archived, userId }) => {
    const presetId = await ctx.db.insert("presets", {
      name: name.trim(),
      imageIds,
      depthMaps,
      prompts,
      contentRating,
      archived: archived ?? false,
      userId,
    })

    const uniqueCategories = Array.from(new Set(categories));
    for (const category of uniqueCategories) {
      await ctx.db.insert("presetCategories", {
        presetId,
        name: category.name,
        score: category.score
      })
    }

    return presetId;
  }
})