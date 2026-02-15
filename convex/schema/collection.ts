import { defineTable } from "convex/server";
import { v } from "convex/values";

export const BOOKMARK_TYPE = v.union(
  v.literal("generation"),
  v.literal("outfit"),
  v.literal("item"),
);

export const bookmarks = defineTable({
  userId: v.id("users"),
  type: BOOKMARK_TYPE,
  generationId: v.optional(v.id("generations")),
  outfitId: v.optional(v.id("outfits")),
  itemId: v.optional(v.id("items")),
})
  .index("by_user_type", ["userId", "type"])
  .index("by_user_generation", ["userId", "generationId"])
  .index("by_user_outfit", ["userId", "outfitId"])
  .index("by_user_item", ["userId", "itemId"])

export const bookmarkStats = defineTable({
  generationId: v.optional(v.id("generations")),
  outfitId: v.optional(v.id("outfits")),
  itemId: v.optional(v.id("items")),
  type: BOOKMARK_TYPE,
  count: v.number(),
  updatedAt: v.number(),
})
  .index("by_generation_id", ["generationId"])
  .index("by_outfit_id", ["outfitId"])
  .index("by_item_id", ["itemId"]);