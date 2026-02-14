"use node"
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Doc } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";
import { imageCategorizer } from "../tools/imageCategorizer";
import { presetCreator } from "../tools/presetCreator";

type Return = {
  prompt: Awaited<ReturnType<typeof presetCreator.handler>>;
  categories: Awaited<ReturnType<typeof imageCategorizer.handler>>;
}

export const _internal = internalAction({
  args: {
    userId: v.id("users"),
    imageId: v.id("images"),
  },
  handler: async (ctx, { imageId, userId }): Promise<Return> => {
    let image: Doc<'images'> | null = null;
    try {
      image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
      if (!image) { throw new Error("Image not found"); }

      const toolCtx = {
        runQuery: ctx.runQuery,
        runMutation: ctx.runMutation,
        scheduler: ctx.scheduler,
        runAction: ctx.runAction,
        auth: ctx.auth,
        storage: ctx.storage,
        vectorSearch: ctx.vectorSearch,
        userId: userId,
      }

      const [prompt, categories] = (await Promise.all([
        presetCreator.handler(toolCtx, { imageUrl: image.url }),
        imageCategorizer.handler(toolCtx, { imageUrl: image.url }),
      ]));

      return { prompt, categories };

    } catch {
      // Cleanup uploaded image on failure
      if (image) await ctx.scheduler.runAfter(10000,
        internal.router.storage.images.deleteOne._internal, { imageId: image._id });
    }

    throw new Error("Failed to create preset prompt.");
  }
})