import { v } from "convex/values";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args) => {
    const { generationId, outfitId } = args;

    if ([generationId, outfitId].filter(Boolean).length !== 1)
      throw new Error("Exactly one of generationId or outfitId  must be provided");

    if (generationId) {
      const isLiked = await ctx.db
        .query("likes")
        .withIndex("by_user_generation", (q) =>
          q.eq("userId", ctx.userId).eq("generationId", generationId)
        )
        .first();
      return !!isLiked;
    }

    if (outfitId) {
      const isLiked = await ctx.db
        .query("likes")
        .withIndex("by_user_outfit", (q) =>
          q.eq("userId", ctx.userId).eq("outfitId", outfitId)
        )
        .first();
      return !!isLiked;
    }

    return false;
  }
})