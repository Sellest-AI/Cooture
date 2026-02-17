import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getOutfit } from "../../functions/outfits";
import { authQuery, QueryCtx } from "../../procedures";

const getPublicOutfits = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const outfits = await ctx.db.query("outfits")
    .withIndex('by_user_id', q => q.eq('userId', userId))
    .order('desc')
    .collect();

  const detailedOutfits = await Promise.all(outfits.map(async (outfit) => {
    return getOutfit(ctx, outfit);
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