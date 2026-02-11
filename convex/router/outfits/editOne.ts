import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    outfitId: v.id("outfits"),
    name: v.optional(v.string()),
    items: v.optional(v.array(v.id("items"))),
  },
  handler: async (ctx, args) => {
    if (args.name !== undefined) {
      await ctx.db.patch(args.outfitId, {
        name: args.name,
        updatedAt: Date.now(),
      })
    }

    if (args.items !== undefined) {
      const existingOutfitItems = await ctx.db.query('outfitItems')
        .withIndex('by_outfit_id', (q) => q.eq('outfitId', args.outfitId))
        .collect();

      // Remove items that are no longer in the outfit
      const itemsToRemove = existingOutfitItems.filter(oi => !args.items!.includes(oi.itemId));
      for (const outfitItem of itemsToRemove) { await ctx.db.delete(outfitItem._id); }

      // Add new items to the outfit
      const itemsToAdd = args.items.filter(itemId => !existingOutfitItems.some(oi => oi.itemId === itemId));
      for (const itemId of itemsToAdd) { await ctx.db.insert('outfitItems', { outfitId: args.outfitId, itemId, }) }

      if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
        await ctx.scheduler.runAfter(0, internal.router.outfits.updateCover._internal, { outfitId: args.outfitId });
      }
    }

    return true;
  }
})