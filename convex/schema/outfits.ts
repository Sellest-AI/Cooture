import { defineTable } from "convex/server";
import { v } from "convex/values";
import { CONTENT_RATINGS } from "./constants";

export const outfits = defineTable({
  name: v.string(),
  updatedAt: v.number(),
  userId: v.id("users"),
  coverId: v.optional(v.id("images")),
  backgroundColor: v.optional(v.string()),
  contentRating: CONTENT_RATINGS,
  tags: v.optional(v.string()),
})
  .searchIndex("search_tags", { searchField: "tags", filterFields: ["userId"] })
  .index("by_user_id", ["userId"]);

export const suggestedOutfits = defineTable({
  userId: v.optional(v.id("users")), // To optionally store local generation for a user specifically
  searchableText: v.string(), // "id1 id2 style_STREETWEAR style_CASUAL"
  mainColors: v.array(v.string()),
  styles: v.array(v.string()), // The array of generated styles
  items: v.array(v.id("items")), // The composed combination of items
  signature: v.string(), // Sorted IDs joined by "_" for exact duplicate prevention
})
  .index("by_user_id", ["userId"])
  .index("by_signature", ["signature"])
  .searchIndex("search_text", { searchField: "searchableText", filterFields: ["userId"] });

export const outfitItems = defineTable({
  outfitId: v.id("outfits"),
  itemId: v.id("items"),
})
  .index("by_item_id", ["itemId"])
  .index("by_outfit_id", ["outfitId"]);