import { defineTable } from "convex/server";
import { v } from "convex/values";

export const presets = defineTable({
  name: v.string(),
  imageIds: v.array(v.id("images")),
  prompts: v.array(v.string()),
})

export const presetGenerations = defineTable({
  presetId: v.id("presets"),
  generationId: v.id("generations"),
  outfitId: v.optional(v.id("outfits")),
  prompts: v.array(v.string()),
})
  .index("by_generation_id", ["generationId"]);