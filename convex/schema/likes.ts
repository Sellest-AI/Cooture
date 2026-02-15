import { defineTable } from "convex/server";
import { v } from "convex/values";

export const LIKEABLE_TYPE = v.union(
  v.literal("generation"),
  v.literal("outfit"),
);

export const likes = defineTable({
  userId: v.id("users"),
  type: LIKEABLE_TYPE,
  generationId: v.optional(v.id("generations")),
  outfitId: v.optional(v.id("outfits")),
  createdAt: v.number(),
})
  .index("by_user_type", ["userId", "type"])
  .index("by_user_generation", ["userId", "generationId"])
  .index("by_user_outfit", ["userId", "outfitId"])

export const likeStats = defineTable({
  generationId: v.optional(v.id("generations")),
  outfitId: v.optional(v.id("outfits")),
  type: LIKEABLE_TYPE,
  count: v.number(),
  updatedAt: v.number(),
})
  .index("by_generation_id", ["generationId"])
  .index("by_outfit_id", ["outfitId"]);
