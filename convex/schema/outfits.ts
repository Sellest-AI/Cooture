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

export const outfitItems = defineTable({
  outfitId: v.id("outfits"),
  itemId: v.id("items"),
})
  .index("by_item_id", ["itemId"])
  .index("by_outfit_id", ["outfitId"]);