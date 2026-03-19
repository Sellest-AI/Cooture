import { ActionCache } from "@convex-dev/action-cache";
import { components, internal } from "../../_generated/api";
import { internalAction, internalQuery } from "../../_generated/server";
import { publicAction } from "../../procedures";

const cache = new ActionCache(components.actionCache, {
  action: internal.router.waitlist.getStatistics._internal_cache,
  name: "getWaitlistStatistics",
  ttl: 1000 * 60 * 30, // 30 minutes
});

type ReturnType = {
  numberOfUsers: number;
} | null

export const _internal_cache = internalAction({
  handler: async (ctx, args): Promise<ReturnType> =>
    ctx.runQuery(internal.router.waitlist.getStatistics._internal_query, args)
})

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY NEW USER.
 */
export const _internal_query = internalQuery({
  handler: async (ctx, args): Promise<ReturnType> => {
    const statistics = await ctx.db.query("waitlist")
      .order("desc").first();

    if (!statistics) return null;

    const WAITING_USERS = 30000;

    return {
      numberOfUsers: statistics.numberOfUsersIn + WAITING_USERS,
    }
  }
})

export const anon = publicAction({
  handler: async (ctx, args): Promise<ReturnType> => await cache.fetch(ctx, args)
})