import { defineTable } from "convex/server";
import { v } from "convex/values";
import { CONTENT_RATINGS } from "./constants";

// ===== PRESET CATEGORIES =====
// Single source of truth for all category values
// This array is used to generate both Convex validators and Zod schemas
export const PRESET_CATEGORY_VALUES = [
  // Subject count
  "SOLO", "DUO", "TRIO", "GROUP",

  // Location/Environment
  "STUDIO", "NATURE", "CITY", "BEACH", "INDOOR", "STREET",

  // Style/Aesthetic
  "CASUAL", "FORMAL", "VINTAGE", "EDITORIAL", "CANDID", "ARTISTIC",

  // Purpose
  "ENTERPRISE", "HEADSHOT", "LIFESTYLE", "FASHION", "SOCIAL_MEDIA", "COMMERCIAL",

  // Technical/Special
  "TRICKS", "DRAMATIC_LIGHTING", "NATURAL_LIGHT", "FLASH", "BLACK_WHITE", "GOLDEN_HOUR",

  // Shot Composition
  "FULL_BODY", "HALF_BODY", "CLOSEUP", "ACTION", "POV",

  // Mood
  "MOODY", "BRIGHT", "PLAYFUL", "SERIOUS", "ROMANTIC",
] as const;

// TypeScript type derived from the array
export type PresetCategory = typeof PRESET_CATEGORY_VALUES[number];

// Convex validator derived from the array
export const PRESET_CATEGORIES = v.union(
  ...PRESET_CATEGORY_VALUES.map(cat => v.literal(cat))
);

export const PRESET_PROMPT = v.object({
  sceneDescriptionShort: v.optional(v.string()),
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
  subjects: v.array(v.object({
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
    })
  })),
  composition: v.object({
    shotType: v.string(),
    cameraAngle: v.string(),
    cameraPosition: v.string(),
    subjectsPlacement: v.string(),
    photographicTricks: v.array(v.string()),
    backgroundOrientation: v.string(),
    focus: v.string(),
  }),
  technical: v.object({
    camera: v.string(),
    postProcessing: v.string(),
    focalLength: v.string(),
  }),
});

export const presets = defineTable({
  name: v.string(),
  imageIds: v.array(v.id("images")),
  depthMaps: v.array(v.id("images")),
  prompts: v.array(PRESET_PROMPT),
  contentRating: CONTENT_RATINGS,
  archived: v.boolean(),
  userId: v.optional(v.id("users")),
})
  .index("by_user_id", ["userId"])
  .index("by_archived", ["archived"])
  .searchIndex("search_name", { searchField: "name" })

export const presetCategories = defineTable({
  presetId: v.id("presets"),
  name: PRESET_CATEGORIES,
  score: v.number(),
})
  .index("by_preset_id", ["presetId"])
  .index("by_name_score", ["name", "score"])

export const presetGenerations = defineTable({
  presetId: v.id("presets"),
  generationId: v.id("generations"),
  outfitId: v.optional(v.id("outfits")),
  prompts: v.array(v.string()),
  userIds: v.optional(v.array(v.id("users"))),
})
  .index("by_preset_id", ["presetId"])
  .index("by_generation_id", ["generationId"])
  .index("by_outfit_id", ["outfitId"])