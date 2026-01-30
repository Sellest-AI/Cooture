import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query('outfitItems')
      .withIndex('by_outfit_id', q => q.eq('outfitId', args.outfitId)).collect();
    for (const { _id } of items) { await ctx.db.delete('outfitItems', _id); }
    await ctx.db.delete(args.outfitId);
  }
})