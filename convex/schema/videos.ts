import { defineTable } from "convex/server";
import { v } from "convex/values";

export const VIDEO_TAGS = v.array(v.union(
  v.literal("VIDEO"),
  v.literal("GENERATED"),
  v.literal("TEXT_TO_VIDEO"),
  v.literal("IMAGE_TO_VIDEO"),
  v.literal("SEEDANCE"),
  v.literal("KLING"),
))

export const videos = defineTable({
  key: v.string(), // Unique key
  url: v.string(),
  fps: v.number(),
  width: v.number(),
  height: v.number(),
  durationMs: v.number(), // in milliseconds
  size: v.number(),
  mimeType: v.string(),
  alt: v.optional(v.string()),
  tags: VIDEO_TAGS,
  thumbnailId: v.optional(v.id("images")), // Reference to thumbnail image
  format: v.optional(v.string()), // mp4, webm, etc.
  updatedAt: v.number(),
})

export const userVideos = defineTable({
  userId: v.id('users'),
  videoId: v.id('videos'),
})
  .index("by_video_id", ["videoId"])
  .index("by_user_id", ["userId"]);