"use node"
import { extractMainColors } from "@/lib/image/node";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { itemCategorizer } from "../tools/itemCategorizer";

export const _internal = internalAction({
  args: {
    imageId: v.id("images"),
    extractText: v.optional(v.boolean()),
    metadata: v.optional(v.object({
      brand: v.optional(v.string()),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { imageId, extractText, metadata }) => {
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
      userId: undefined,
    }

    const object = await itemCategorizer.handler(toolCtx, { imageUrl: image.url, extractText, metadata });
    const colors = await extractMainColors(image.url)

    return {
      ...object,
      mainColors: colors,
    };
  }
})