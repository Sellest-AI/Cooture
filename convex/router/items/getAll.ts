import { ActionCache } from "@convex-dev/action-cache";
import { notEmpty, uniqueArray } from "@shared/utils";
import { v } from "convex/values";
import { components, internal } from "../../_generated/api";
import { Doc, Id } from "../../_generated/dataModel";
import { ActionCtx, internalAction, internalQuery } from "../../_generated/server";
import { getImage, GetImageDoc } from "../../functions/images";
import { authAction, publicAction } from "../../procedures";

const cache = new ActionCache(components.actionCache, {
  action: internal.router.items.getAll._internal_cache,
  name: "getAllItems",
  ttl: 1000 * 60 * 5, // 5 minutes
});

type ReturnType = (Doc<'items'> & { image: NonNullable<GetImageDoc> })[]

export const _internal_cache = internalAction({
  handler: async (ctx, args): Promise<ReturnType> =>
    ctx.runQuery(internal.router.items.getAll._internal_query_1)
})

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY LIKES.
 */
export const _internal_query_1 = internalQuery({
  handler: async (ctx): Promise<ReturnType> => {
    const publicItems = await ctx.db.query("items")
      .order('desc')
      .take(50);

    const detailedItems = await Promise.all(publicItems.map(async (item) => {
      const image = await getImage(ctx, item.imageId);
      if (!image) return null;
      return {
        ...item,
        image
      }
    }));

    return detailedItems.filter(notEmpty);
  }
})

export const _internal_query_2 = internalQuery({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args): Promise<ReturnType> => {
    const { userId } = args;

    if (!userId) return [];

    const userItems = await ctx.db.query("items")
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .order('desc')
      .collect();

    const detailedItems = await Promise.all(userItems.map(async (item) => {
      const image = await getImage(ctx, item.imageId);
      if (!image) return null;
      return {
        ...item,
        image
      }
    }));

    return detailedItems.filter(notEmpty);
  }
});

const getItems = async (ctx: ActionCtx, userId?: Id<'users'>): Promise<ReturnType> => {
  const userItems = await ctx.runQuery(internal.router.items.getAll._internal_query_2, { userId });
  const publicItems = await cache.fetch(ctx, {});

  const items = [
    ...userItems.slice(0, 8),
    ...publicItems.slice(0, 8),
    ...userItems.slice(8, 16),
    ...publicItems.slice(8, 16),
    ...userItems.slice(16),
    ...publicItems.slice(16)
  ];

  const uniqueItems = uniqueArray(items.map((i) => i._id));
  return uniqueItems.map((id) => items.find((i) => i._id === id)).filter(notEmpty);
}

export const authed = authAction({
  args: {},
  handler: async (ctx) => getItems(ctx, ctx.userId)
})

export const anon = publicAction({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => getItems(ctx, args.userId)
})