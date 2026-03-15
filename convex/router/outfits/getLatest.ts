import { ActionCache } from "@convex-dev/action-cache";
import { notEmpty } from "@shared/utils";
import { components, internal } from "../../_generated/api";
import { internalAction, internalQuery } from "../../_generated/server";
import { getOutfit } from "../../functions/outfits";
import { publicAction } from "../../procedures";

const cache = new ActionCache(components.actionCache, {
  action: internal.router.outfits.getLatest._internal_cache,
  name: "getLatestOutfits",
  ttl: 1000 * 60 * 60 * 2, // 2 hours
});

export const _internal_cache = internalAction({
  handler: async (ctx, args): Promise<Returned> =>
    ctx.runQuery(internal.router.outfits.getLatest._internal_query)
})

type Returned = NonNullable<Awaited<ReturnType<typeof getOutfit>>>[];

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY NEW OUTFIT.
 */
export const _internal_query = internalQuery({
  handler: async (ctx): Promise<Returned> => {
    const results = await ctx.db.query("outfits")
      .order('desc')
      .take(32);

    const outfits = await Promise.all(results.map(async (outfit) => {
      return getOutfit(ctx, outfit);
    }));

    return outfits.filter(notEmpty);
  }
})

export const anon = publicAction({
  handler: async (ctx, args): Promise<Returned> =>
    cache.fetch(ctx, args)
})