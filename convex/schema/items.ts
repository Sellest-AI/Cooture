import { defineTable } from "convex/server";
import { v } from "convex/values";
import { CONTENT_RATINGS } from "./constants";

export const ITEM_CATEGORIES = v.union(
  v.literal("TOP"),
  v.literal("BOTTOM"),
  v.literal("DRESS"),
  v.literal("OUTERWEAR"),
  v.literal("JACKET"),
  v.literal("SHOES"),
  v.literal("ACCESSORY"),
  v.literal("HOODIE"),
  v.literal("SWEATER"),
  v.literal("TSHIRT"),
  v.literal("JEANS"),
  v.literal("SKIRT"),
  v.literal("HAT"),
  v.literal("CAP"),
  v.literal("GLASSES"),
  v.literal("BAG"),
)

export const ITEM_WEATHERS = v.union(
  v.literal("COLD"),
  v.literal("WARM"),
  v.literal("HOT"),
  v.literal("RAINY"),
  v.literal("SNOWY"),
  v.literal("SUNNY"),
  v.literal("WINDY"),
)

export const ITEM_COLOR_TONES = v.union(
  v.literal("LIGHT"),
  v.literal("DARK"),
  v.literal("NEUTRAL"),
  v.literal("COLORFUL"),
)

export const ITEM_MATERIAL_FEEL = v.union(
  v.literal("SOFT"),
  v.literal("MEDIUM"),
  v.literal("FIRM"),
  v.literal("RIGID"),
)

export const ITEM_MATERIALS = v.union(
  v.literal("COTTON"),
  v.literal("WOOL"),
  v.literal("LEATHER"),
  v.literal("DENIM"),
  v.literal("SILK"),
  v.literal("SYNTHETIC"),
  v.literal("PLASTIC"),
  v.literal("METAL"),
  v.literal("GLASS"),
  v.literal("RUBBER"),
  v.literal("WOOD"),
)

export const ITEM_GENDERS = v.union(
  v.literal("UNISEX"),
  v.literal("MALE"),
  v.literal("FEMALE"),
)

export const ITEMS_SCHEMA = {
  name: v.string(),
  description: v.optional(v.string()),
  imageId: v.id("images"),
  category: ITEM_CATEGORIES,
  weatherTags: v.array(ITEM_WEATHERS),
  mainColors: v.array(v.string()),
  colorTones: v.array(ITEM_COLOR_TONES),
  materialFeel: ITEM_MATERIAL_FEEL,
  materials: v.array(ITEM_MATERIALS),
  gender: ITEM_GENDERS,
  contentRating: CONTENT_RATINGS,
  link: v.optional(v.string()),
}

export const items = defineTable({
  ...ITEMS_SCHEMA,
  userId: v.id("users"),
})
  .index("by_user_id", ["userId"])