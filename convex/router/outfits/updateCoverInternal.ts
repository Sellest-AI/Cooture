import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation } from "../../procedures";

/**
 * Last step of the cover update process, which just updates the outfit with the new cover ID, and deletes the old cover from storage if it exists.
 * DO NOT call this directly, use internal.router.outfits.updateCover._internal instead, which will handle generating the new cover and scheduling this mutation.
 */
export const _internal = internalMutation({
  args: {
    outfitId: v.id("outfits"),
    newCoverId: v.id("images"),
  },
  handler: async (ctx, { outfitId, newCoverId }) => {
    const outfit = await ctx.db.get(outfitId);
    if (!outfit) return false;

    await ctx.db.patch(outfitId, {
      coverId: newCoverId,
    });

    if (outfit.coverId)
      await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId: outfit.coverId });
  }
})