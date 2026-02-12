import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { upsertFeedScore } from "../../functions/feed";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    name: v.string(),
    items: v.array(v.id("items")),
  },
  handler: async (ctx, args) => {
    const outfit = await ctx.db.insert('outfits', {
      name: args.name,
      userId: ctx.userId,
      updatedAt: Date.now(),
    })

    for (const itemId of args.items) {
      await ctx.db.insert('outfitItems', {
        outfitId: outfit,
        itemId,
      })
    }

    await upsertFeedScore(ctx, { outfitId: outfit });

    await ctx.scheduler.runAfter(0, internal.router.outfits.updateCover._internal, { outfitId: outfit });

    return outfit;
  }
})