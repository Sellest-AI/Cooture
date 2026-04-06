import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation } from "../../_generated/server";

export const _internal = internalMutation({
  args: {
    imageId: v.id("images"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const { imageId, itemId } = args;

    const item = await ctx.db.get(itemId);
    if (!item) return false;

    // Update item with new image
    await ctx.db.patch(itemId, { imageId: imageId });

    // Delete old image
    await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, {
      imageId: item.imageId,
    });

    const outfits = await ctx.db.query("outfitItems")
      .withIndex("by_item_id", q => q.eq("itemId", itemId)).collect();

    await Promise.all(outfits.map(outfit => {
      return ctx.scheduler.runAfter(0, internal.router.outfits.updateCover._internal,
        { outfitId: outfit.outfitId })
    }))
  }
})