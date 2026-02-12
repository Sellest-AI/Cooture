import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, args) => {
    // Delete outfit items
    const items = await ctx.db.query('outfitItems')
      .withIndex('by_outfit_id', q => q.eq('outfitId', args.outfitId)).collect();
    for (const { _id } of items) { await ctx.db.delete(_id); }

    // Delete from feed
    const feedScores = await ctx.db.query('feedScores')
      .withIndex('by_outfit_id', q => q.eq('outfitId', args.outfitId)).collect();
    for (const { _id } of feedScores) { await ctx.db.delete(_id); }

    // Delete from preset generations
    const presetGenerations = await ctx.db.query('presetGenerations').collect();
    for (const record of presetGenerations) {
      if (record.outfitId === args.outfitId) {
        await ctx.db.delete(record._id);
      }
    }

    // Delete outfit
    await ctx.db.delete(args.outfitId);
  }
})