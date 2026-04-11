import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userBlocks = defineTable({
  blockerId: v.id("users"),
  blockedId: v.id("users"),
})
  .index("by_blocker", ["blockerId"])
  .index("by_blocked", ["blockedId"])
  .index("by_blocker_and_blocked", ["blockerId", "blockedId"]);

export const reportStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected")
);

export const userReports = defineTable({
  userId: v.id("users"),
  outfitId: v.optional(v.id("outfits")),
  generationId: v.optional(v.id("generations")),
  presetId: v.optional(v.id("presets")),
  itemId: v.optional(v.id("items")),
  reason: v.string(),
  status: reportStatus,
})
  .index("by_reporter", ["userId"])
  .index("by_status", ["status"]);
