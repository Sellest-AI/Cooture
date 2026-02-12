import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getImage } from "../../functions/images";
import { authQuery, QueryCtx } from "../../procedures";

const getPublicOutfits = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const outfits = await ctx.db.query("outfits")
    .withIndex('by_user_id', q => q.eq('userId', userId))
    .order('desc')
    .collect();

  const detailedOutfits = await Promise.all(outfits.map(async (outfit) => {
    const items = await ctx.db.query('outfitItems')
      .withIndex('by_outfit_id', q => q.eq('outfitId', outfit._id)).collect();

    const coverId = outfit.coverId ??
      await ctx.db.get(items[0].itemId).then(item => item?.imageId);

    if (!coverId) return null;
    const image = await getImage(ctx, coverId);
    if (!image) return null;

    return {
      ...outfit,
      items,
      itemsCount: items.length,
      cover: image
    }
  }));

  return detailedOutfits.filter(notEmpty);
}

export const authed = authQuery({
  args: {},
  handler: async (ctx) => getPublicOutfits(ctx, ctx.userId)
})

export const anon = authQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => getPublicOutfits(ctx, userId)
})