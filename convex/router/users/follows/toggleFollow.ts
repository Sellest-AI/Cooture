import { ConvexError, v } from "convex/values";
import { Id } from "../../../_generated/dataModel";
import { authMutation, MutationCtx } from "../../../procedures";

export const authed = authMutation({
  args: {
    targetUserId: v.id("users"),
    value: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { targetUserId } = args;

    // Cannot follow yourself
    if (ctx.userId === targetUserId) {
      throw new ConvexError("Cannot follow yourself");
    }

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", ctx.userId).eq("followingId", targetUserId)
      )
      .first();

    if (existing && args.value === true) return { following: true };

    if (existing) {
      // Unfollow
      await ctx.db.delete(existing._id);
      await updateStats(ctx, ctx.userId, targetUserId, -1);
      return { following: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: ctx.userId,
        followingId: targetUserId,
        createdAt: Date.now(),
      });
      await updateStats(ctx, ctx.userId, targetUserId, 1);
      return { following: true };
    }
  },
});

async function updateStats(
  ctx: MutationCtx,
  followerId: Id<'users'>,
  followingId: Id<'users'>,
  increment: number
) {
  // Update follower's following count
  const followerStats = await ctx.db
    .query("followStats")
    .withIndex("by_user_id", (q) => q.eq("userId", followerId))
    .first();

  if (followerStats) {
    await ctx.db.patch(followerStats._id, {
      followingCount: Math.max(0, followerStats.followingCount + increment),
      updatedAt: Date.now(),
    });
  } else if (increment > 0) {
    await ctx.db.insert("followStats", {
      userId: followerId,
      followersCount: 0,
      followingCount: 1,
      updatedAt: Date.now(),
    });
  }

  // Update following user's followers count
  const followingStats = await ctx.db
    .query("followStats")
    .withIndex("by_user_id", (q) => q.eq("userId", followingId))
    .first();

  if (followingStats) {
    await ctx.db.patch(followingStats._id, {
      followersCount: Math.max(0, followingStats.followersCount + increment),
      updatedAt: Date.now(),
    });
  } else if (increment > 0) {
    await ctx.db.insert("followStats", {
      userId: followingId,
      followersCount: 1,
      followingCount: 0,
      updatedAt: Date.now(),
    });
  }
}
