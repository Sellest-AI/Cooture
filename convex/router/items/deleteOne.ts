import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { isAuthorized } from "../../functions/users";
import { authMutation } from "../../procedures";

type Return = {
  success: boolean;
  associatedOutfits: Id<'outfits'>[];
}

export const authed = authMutation({
  args: {
    itemId: v.id("items")
  },
  handler: async (ctx, { itemId }): Promise<Return> => {
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    await isAuthorized(ctx, item);

    // If item in an outfit, prevent
    const outfitItems = await ctx.db.query('outfitItems')
      .withIndex('by_item_id', (q) => q.eq('itemId', itemId))
      .collect();

    const outfits = outfitItems.map((o) => o.outfitId);
    if (outfits.length > 0) return { success: false, associatedOutfits: outfits }

    // Remove bookmarks associated with the item
    await ctx.runMutation(internal.router.collection.toggleBookmark._internal, {
      itemId: itemId,
      userId: ctx.userId,
      value: false,
    }).catch(() => null);

    // Delete image
    const image = item.imageId;
    await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId: image });

    return {
      success: true,
      associatedOutfits: outfits,
    }
  }
})