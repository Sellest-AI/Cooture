import { defineTable } from "convex/server";
import { v } from "convex/values";

export const IMAGE_TAGS = v.array(v.union(
  v.literal("IMAGE"),
  v.literal("OBJECT"),
))

export const images = defineTable({
  hasAlpha: v.boolean(), // true if is rgba with transparent pixels
  hashBase64: v.optional(v.string()), // Hash of the image content
  key: v.string(), // Unique key
  url: v.string(),
  width: v.number(),
  height: v.number(),
  size: v.number(),
  mimeType: v.string(),
  alt: v.optional(v.string()),
  tags: IMAGE_TAGS,
  updatedAt: v.number(),
}).index("by_hash", ["hashBase64"])

export const imageSizes = defineTable({
  imageId: v.id("images"), // Reference to the parent Image
  quality: v.number(),
  key: v.string(), // Unique key
  width: v.number(),
  height: v.number(),
  url: v.string(),
  size: v.number(),
}).index("by_image_id", ["imageId"]);

export const imageObjects = defineTable({
  imageId: v.id("images"), // Reference to the Image
  baseImageId: v.id("images"), // Reference to the base Image
  x: v.number(),
  y: v.number(),
  updatedAt: v.number(),
}).index("by_image_id", ["imageId"])
  .index("by_base_image_id", ["baseImageId"]);

export const userImages = defineTable({
  userId: v.id('users'),
  imageId: v.id('images'),
})
  .index("by_image_id", ["imageId"])
  .index("by_user_id", ["userId"]);