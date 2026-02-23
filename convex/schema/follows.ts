import { defineTable } from "convex/server";
import { v } from "convex/values";

export const follows = defineTable({
  /** The person who is following */
  followerId: v.id("users"),
  /** The person being followed */
  followingId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_follower", ["followerId"])
  .index("by_following", ["followingId"])
  .index("by_follower_following", ["followerId", "followingId"])

export const followStats = defineTable({
  userId: v.id("users"),
  followersCount: v.number(),
  followingCount: v.number(),
  updatedAt: v.number(),
})
  .index("by_user_id", ["userId"]);
