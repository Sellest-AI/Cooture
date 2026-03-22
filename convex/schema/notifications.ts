import { defineTable } from "convex/server";
import { v } from "convex/values";

export const NOTIFICATION_TYPE = v.union(
  v.literal("generation_ready"),
  v.literal("new_like"),
  v.literal("new_follower"),
  v.literal("tagged_in_generation"),
  v.literal("waitlist_approval"),
  v.literal("outfit_used")
)

export const NOTIFICATION_CHANNEL: Record<typeof NOTIFICATION_TYPE['type'], string> = {
  "generation_ready": "generation_ready",
  "outfit_used": "social",
  "new_like": "social",
  "new_follower": "social",
  "tagged_in_generation": "social",
  "waitlist_approval": "system",
}

export const notifications = defineTable({
  userId: v.id("users"),
  type: NOTIFICATION_TYPE,
  read: v.boolean(),

  // who caused it
  actorId: v.optional(v.id("users")),

  // references — only populate what's relevant
  generationId: v.optional(v.id("generations")),
  outfitId: v.optional(v.id("outfits")),

  // aggregation
  aggregationCount: v.optional(v.number()), // starts at 1
  aggregationKey: v.optional(v.string()),
  aggregatedUntil: v.optional(v.number()),

  lastPushSentAt: v.optional(v.number()),
  updatedAt: v.number(),
})
  .index("by_user_id", ["userId"])
  .index("by_user_read", ["userId", "read"])
  .index("by_aggregation_key", ["aggregationKey"])

export const pushTokens = defineTable({
  userId: v.id("users"),
  token: v.string(),
})
  .index("by_user_id", ["userId"])
  .index("by_token", ["token"])