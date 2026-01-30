"use node"
import { extractMainColors } from "@/lib/image/node";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { itemCategorizer } from "../tools/itemCategorizer";

export const _internal = internalAction({
  args: {
    userId: v.id("users"),
    imageId: v.id("images"),
    extractText: v.optional(v.boolean()),
  },
  handler: async (ctx, { imageId, userId, extractText }) => {
    const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
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

    const object = await itemCategorizer.handler(toolCtx, { imageUrl: image.url, extractText });
    const colors = await extractMainColors(image.url)

    return {
      ...object,
      mainColors: colors,
    };
  }
})