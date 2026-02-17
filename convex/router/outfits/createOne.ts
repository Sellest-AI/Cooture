import { faker } from '@faker-js/faker';
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { upsertFeedScore } from "../../functions/feed";
import { isOutfitNFSW } from '../../functions/outfits';
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    name: v.optional(v.string()),
    items: v.array(v.id("items")),
  },
  handler: async (ctx, args) => {
    const fallbackName = [
      faker.commerce.productAdjective(),
      faker.helpers.maybe(() => faker.science.chemicalElement().name, { probability: 0.3 }),
      faker.animal.petName(),
    ].filter(Boolean).join(' ');

    const contentRating = await isOutfitNFSW(ctx, args.items);

    const outfit = await ctx.db.insert('outfits', {
      name: args.name || fallbackName,
      userId: ctx.userId,
      updatedAt: Date.now(),
      contentRating
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