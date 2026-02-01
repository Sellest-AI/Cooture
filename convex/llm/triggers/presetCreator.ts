"use node"
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Doc } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";
import { presetCreator } from "../tools/presetCreator";

export const _internal = internalAction({
  args: {
    userId: v.id("users"),
    imageId: v.id("images"),
  },
  handler: async (ctx, { imageId, userId }) => {
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

      const object = await presetCreator.handler(toolCtx, { imageUrl: image.url });
      return object;
    } catch {
      // Cleanup uploaded image on failure
      if (image) await ctx.scheduler.runAfter(10000,
        internal.router.storage.images.deleteOne._internal, { imageId: image._id });
    }

    throw new Error("Failed to create preset prompt.");
  }
})