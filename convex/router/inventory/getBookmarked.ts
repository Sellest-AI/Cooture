import { v } from "convex/values";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
    itemId: v.optional(v.id("items")),
  },
  handler: async (ctx, args) => {
    const { generationId, outfitId, itemId } = args;

    if ([generationId, outfitId, itemId].filter(Boolean).length !== 1)
      throw new Error("Exactly one of generationId, outfitId, or itemId must be provided");

    if (generationId) {
      const isBookmarked = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_generation", (q) =>
          q.eq("userId", ctx.userId).eq("generationId", generationId)
        )
        .first();
      return !!isBookmarked;
    }

    if (outfitId) {
      const isBookmarked = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_outfit", (q) =>
          q.eq("userId", ctx.userId).eq("outfitId", outfitId)
        )
        .first();
      return !!isBookmarked;
    }

    if (itemId) {
      const isBookmarked = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_item", (q) =>
          q.eq("userId", ctx.userId).eq("itemId", itemId)
        )
        .first();
      return !!isBookmarked;
    }

    return false;
  }
})