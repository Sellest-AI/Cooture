import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getImage } from "../../functions/images";
import { authQuery, publicQuery, QueryCtx } from "../../procedures";

const getPublicItems = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const items = await ctx.db.query("items")
    .withIndex('by_user_id', q => q.eq('userId', userId))
    .order('desc')
    .collect();

  const detailedItems = await Promise.all(items.map(async (item) => {
    const image = await getImage(ctx, item.imageId);
    if (!image) return null;
    return {
      ...item,
      image
    }
  }));

  return detailedItems.filter(notEmpty);
}

export const authed = authQuery({
  args: {},
  handler: async (ctx) => getPublicItems(ctx, ctx.userId)
})

export const anon = publicQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => getPublicItems(ctx, args.userId)
})