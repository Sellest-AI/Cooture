import { defineTable } from "convex/server";
import { v } from "convex/values";

export const feedScores = defineTable({
  score: v.number(),
  generationId: v.optional(v.id('generations')),
  outfitId: v.optional(v.id('outfits')),
  updatedAt: v.number(), // timestamp in ms
  userId: v.id('users'),
  archived: v.boolean(),
})
  .index("by_archived_score", ["archived", "score"])
  .index("by_generation_id", ["generationId"])
  .index("by_outfit_id", ["outfitId"])