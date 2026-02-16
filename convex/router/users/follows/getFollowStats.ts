import { ActionCache } from "@convex-dev/action-cache";
import { v } from "convex/values";
import { components, internal } from "../../../_generated/api";
import { internalAction, internalQuery } from "../../../_generated/server";
import { publicAction } from "../../../procedures";

const cache = new ActionCache(components.actionCache, {
  action: internal.router.users.follows.getFollowStats._internal_cache,
  name: "getFollowStats",
  ttl: 1000 * 60 * 30, // 30 minutes
});

type ReturnType = {
  followersCount: number;
  followingCount: number;
  lastUpdate: number;
}

export const _internal_cache = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<ReturnType> =>
    ctx.runQuery(internal.router.users.follows.getFollowStats._internal_query, args)
})

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY FOLLOW/UNFOLLOW.
 */
export const _internal_query = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<ReturnType> => {
    const stats = await ctx.db
      .query("followStats")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    const lastUpdate = new Date();

    return {
      followersCount: stats?.followersCount ?? 0,
      followingCount: stats?.followingCount ?? 0,
      lastUpdate: lastUpdate.getTime(),
    };
  }
})

export const anon = publicAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<ReturnType> => {
    return cache.fetch(ctx, args);
  }
})
