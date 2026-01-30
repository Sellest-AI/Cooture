import { defineTable } from "convex/server";
import { v } from "convex/values";

export const PREDICTION_STATUS = v.union(
  v.literal("LOADING"),
  v.literal("FAILED"),
  v.literal("PENDING"),
  v.literal("ACCEPTED"),
  v.literal("REJECTED"),
)

export const GENERATION_STATUS = v.union(
  v.literal("LOADING"),
  v.literal("PENDING"),
  v.literal("COMPLETED"),
)

export const predictions = defineTable({
  imageId: v.optional(v.id("images")),
  generationId: v.optional(v.id("generations")),
  predictionId: v.string(),
  status: PREDICTION_STATUS,
  readyAt: v.optional(v.number()), // timestamp in ms
})
  .index("by_generation_id", ["generationId"])
  .index("by_prediction_id", ["predictionId"])

export const generations = defineTable({
  userId: v.id("users"),
  status: GENERATION_STATUS,
  completedAt: v.optional(v.number()), // timestamp in ms
})
  .index("by_status_and_user_id", ["status", "userId"])
  .index("by_user_id", ["userId"]);