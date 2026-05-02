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

type ReturnType = (Doc<'items'> & { image: NonNullable<GetImageDoc>, ownedByUser?: boolean })[]

const sharedArgs = { filter: v.optional(v.string()) }

export const _internal_cache = internalAction({
  args: sharedArgs,
  handler: async (ctx, args): Promise<ReturnType> =>
    ctx.runQuery(internal.router.items.getAll._internal_query_1, { filter: args.filter })
})

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY LIKES.
 */
export const _internal_query_1 = internalQuery({
  args: sharedArgs,
  handler: async (ctx, args): Promise<ReturnType> => {
    const publicItems = ctx.db.query("items").order('desc');

    const detailedItems: ReturnType = [];
    let i = 0;
    for await (const item of publicItems) {
      if (i >= 50) break;

      let matches = args.filter ? false : true;
      if (args.filter) {
        if (item.category === args.filter) matches = true;
        if (item.description?.includes(args.filter)) matches = true;
        if (item.brand?.includes(args.filter)) matches = true;
      }

      if (!matches) continue;

      const image = await getImage(ctx, item.imageId);
      if (!image) continue;

      detailedItems.push({
        ...item,
        image
      });
      i++;
    }

    return detailedItems;
  }
})

export const _internal_query_2 = internalQuery({
  args: { ...sharedArgs, userId: v.optional(v.id('users')) },
  handler: async (ctx, args): Promise<ReturnType> => {
    const { userId, filter } = args;

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
        image,
        ownedByUser: true,
      }
    }));

    return detailedItems
      .filter((item) => {
        if (!item) return false;
        if (!filter) return true;

        const matchesCategory = item.category === filter;
        const matchesDescription = item.description?.includes(filter);
        const matchesBrand = item.brand?.includes(filter);
        return matchesCategory || matchesDescription || matchesBrand;
      })
      .filter(notEmpty);
  }
});

const getItems = async (ctx: ActionCtx, args: { userId?: Id<'users'>, filter?: string }): Promise<ReturnType> => {
  const userItems = await ctx.runQuery(internal.router.items.getAll._internal_query_2, { userId: args.userId, filter: args.filter });
  const publicItems = await cache.fetch(ctx, { filter: args.filter });

  const items = [
    ...userItems.slice(0, 12),
    ...publicItems.slice(0, 12),
    ...userItems.slice(12, 24),
    ...publicItems.slice(12, 24),
    ...userItems.slice(24),
    ...publicItems.slice(24)
  ];

  const uniqueItems = uniqueArray(items.map((i) => i._id));
  return uniqueItems.map((id) => items.find((i) => i._id === id)).filter(notEmpty);
}

export const authed = authAction({
  args: sharedArgs,
  handler: async (ctx, args) => getItems(ctx, { ...args, userId: ctx.userId })
})

export const anon = publicAction({
  args: { userId: v.optional(v.id('users')), ...sharedArgs },
  handler: async (ctx, args) => getItems(ctx, args)
})