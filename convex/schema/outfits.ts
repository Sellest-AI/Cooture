import { defineTable } from "convex/server";
import { v } from "convex/values";

export const outfits = defineTable({
  name: v.string(),
  updatedAt: v.number(),
  userId: v.id("users"),
  coverId: v.optional(v.id("images")),
  backgroundColor: v.optional(v.string()),
  isNSFW: v.boolean(),
})
  .index("by_user_id", ["userId"]);

export const outfitItems = defineTable({
  outfitId: v.id("outfits"),
  itemId: v.id("items"),
}).index("by_outfit_id", ["outfitId"]);