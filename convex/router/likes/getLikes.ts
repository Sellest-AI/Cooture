import { ActionCache } from "@convex-dev/action-cache";
import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { components, internal } from "../../_generated/api";
import { internalAction, internalQuery } from "../../_generated/server";
import { publicAction } from "../../procedures";

const cache = new ActionCache(components.actionCache, {
  action: internal.router.likes.getLikes._internal_cache,
  name: "getLikes",
  ttl: 1000 * 60 * 30, // 30 minutes
});

type ReturnType = {
  amount: number;
  lastUpdate: number;
  latestLikers: {
    _id: string;
    name?: string;
    image?: string;
  }[]
}

export const _internal_cache = internalAction({
  args: {
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args): Promise<ReturnType> =>
    ctx.runQuery(internal.router.likes.getLikes._internal_query, args)
})

/** 
 * @warning This is an internal query for caching.
 * Be careful when using it, your queries will refresh ON EVERY LIKES.
 */
export const _internal_query = internalQuery({
  args: {
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args): Promise<ReturnType> => {
    const { generationId, outfitId } = args;
    let stats = null;
    if (generationId) {
      stats = await ctx.db.query("likeStats").withIndex("by_generation_id", (q) =>
        q.eq("generationId", generationId)).first();
    } else if (outfitId) {
      stats = await ctx.db.query("likeStats").withIndex("by_outfit_id", (q) =>
        q.eq("outfitId", outfitId)).first();
    }

    const count = stats?.count ?? 0;
    const userIds = await ctx.db.query("likes").order("desc").take(count > 0 ? 200 : 0);
    const users = await Promise.all(userIds.map(like => ctx.db.get("users", like.userId)));

    const filteredUsers = users.filter(notEmpty)
      .filter((u, i, self) => i === self.findIndex((p) => p._id === u._id))
      // Shuffle
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    const lastUpdate = new Date();

    return {
      amount: count,
      lastUpdate: lastUpdate.getTime(),
      latestLikers: filteredUsers.map((u) => ({ _id: u._id, name: u.name, image: u.image }))
    }
  }
})

export const anon = publicAction({
  args: {
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args): Promise<ReturnType> => {
    return cache.fetch(ctx, args);
  }
})