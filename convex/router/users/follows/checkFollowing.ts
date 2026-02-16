import { v } from "convex/values";
import { authQuery } from "../../../procedures";

export const authed = authQuery({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", ctx.userId).eq("followingId", args.targetUserId)
      )
      .first();

    return { isFollowing: !!follow };
  },
});
