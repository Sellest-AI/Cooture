import { defineTable } from "convex/server";
import { v } from "convex/values";

export const PRESET_PROMPT = v.object({
  sceneDescription: v.string(),
  style: v.object({
    aesthetic: v.string(),
    lighting: v.string(),
    colorPalette: v.string(),
    texture: v.string(),
  }),
  environment: v.object({
    location: v.string(),
    backgroundDetails: v.string(),
    surroundingElements: v.array(v.string()),
  }),
  subject: v.object({
    position: v.string(),
    bodyAlignment: v.string(),
    legs: v.array(v.string()),
    hands: v.array(v.string()),
    heldObjects: v.array(v.string()),
    head: v.object({
      direction: v.union(v.literal("front"), v.literal("side")),
      angle: v.string(),
      expression: v.string(),
      gaze: v.string(),
    })
  }),
  composition: v.object({
    shotType: v.string(),
    cameraAngle: v.string(),
    cameraPosition: v.string(),
    subjectPlacement: v.string(),
    focus: v.string(),
  }),
  technical: v.object({
    camera: v.string(),
    postProcessing: v.string(),
    focalLength: v.string(),
  }),
  outfit: v.object({
    description: v.string(),
    top: v.optional(v.object({
      type: v.string(),
      details: v.string(),
    })),
    bottom: v.optional(v.object({
      type: v.string(),
      details: v.string(),
    })),
    innerLayer: v.optional(v.string()),
    outerwear: v.optional(v.object({
      type: v.string(),
      details: v.string(),
    })),
    accessories: v.array(v.record(v.string(), v.string())),
    shoes: v.optional(v.string()),
  }),
});

export const presets = defineTable({
  name: v.string(),
  imageIds: v.array(v.id("images")),
  prompts: v.array(PRESET_PROMPT),
})

export const presetGenerations = defineTable({
  presetId: v.id("presets"),
  generationId: v.id("generations"),
  outfitId: v.optional(v.id("outfits")),
  prompts: v.array(v.string()),
})
  .index("by_generation_id", ["generationId"]);