import { ActionCache } from "@convex-dev/action-cache";
import { notEmpty, uniqueArray } from "@shared/utils";
import { v } from "convex/values";
import { components, internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx, internalAction, internalQuery } from "../../_generated/server";
import { getOutfit } from "../../functions/outfits";
import { authAction, publicAction } from "../../procedures";

const cache = new ActionCache(components.actionCache, {
  action: internal.router.outfits.getAll._internal_cache,
  name: "getAllOutfits",
  ttl: 1000 * 60 * 5, // 5 minutes
});

type Returned = Promise<NonNullable<Awaited<ReturnType<typeof getOutfit>> & { ownedByUser?: boolean }>[]>;

export const _internal_cache = internalAction({
  handler: async (ctx, args): Returned =>
    ctx.runQuery(internal.router.outfits.getAll._internal_query_1)
})

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY LIKES.
 */
export const _internal_query_1 = internalQuery({
  handler: async (ctx): Returned => {
    const outfits = await ctx.db.query("outfits")
      .order('desc')
      .take(50);

    const detailedOutfits = await Promise.all(outfits.map(async (outfit) => {
      return getOutfit(ctx, outfit);
    }));

    return detailedOutfits.filter(notEmpty);
  }
})

export const _internal_query_2 = internalQuery({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args): Returned => {
    const { userId } = args;

    if (!userId) return [];

    const outfits = await ctx.db.query("outfits")
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .order('desc')
      .collect();

    const detailedOutfits = await Promise.all(outfits.map(async (outfit) => {
      const result = await getOutfit(ctx, outfit);
      if (!result) return null;
      return { ...result, ownedByUser: true };
    }));

    return detailedOutfits.filter(notEmpty);
  }
});

export const authed = authAction({
  args: {},
  handler: async (ctx) => getOutfits(ctx, ctx.userId)
})

export const anon = publicAction({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => getOutfits(ctx, args.userId)
})

const getOutfits = async (ctx: ActionCtx, userId?: Id<'users'>): Returned => {
  const userOutfits = await ctx.runQuery(internal.router.outfits.getAll._internal_query_2, { userId });
  const publicOutfits = await cache.fetch(ctx, {});

  const outfits = [
    ...userOutfits.slice(0, 8),
    ...publicOutfits.slice(0, 8),
    ...userOutfits.slice(8, 16),
    ...publicOutfits.slice(8, 16),
    ...userOutfits.slice(16),
    ...publicOutfits.slice(16)
  ];

  const uniqueOutfits = uniqueArray(outfits.map((i) => i._id));
  return uniqueOutfits.map((id) => outfits.find((i) => i._id === id)).filter(notEmpty);
}