import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { internalMutation } from "../../../_generated/server";
import { VIDEO_TAGS } from "../../../schema/videos";

export const _internal = internalMutation({
  args: {
    userId: v.union(v.null(), v.id("users")),
    thumbnailId: v.optional(v.id("images")),
    dimensions: v.object({ width: v.number(), height: v.number() }),
    format: v.string(),
    mimeType: v.string(),
    size: v.number(),
    durationMs: v.number(),
    tags: v.optional(VIDEO_TAGS),
    key: v.string(),
    url: v.string(),
    fps: v.number(),
  },
  handler: async (ctx, args) => {
    const tagsSet = new Set(['VIDEO' as const, ...(args.tags ?? [])])
    const sanitizedTags = Array.from(tagsSet).filter(notEmpty);

    const videoId = await ctx.db.insert("videos", {
      url: args.url,
      key: args.key,
      size: args.size,
      thumbnailId: args.thumbnailId,
      width: args.dimensions.width,
      height: args.dimensions.height,
      durationMs: args.durationMs,
      mimeType: args.mimeType,
      format: args.format,
      tags: sanitizedTags,
      fps: args.fps,
      updatedAt: Date.now(),
    });

    if (args.userId) {
      await ctx.db.insert("userVideos", {
        userId: args.userId,
        videoId: videoId,
      })
    }

    const savedVideo = await ctx.db.get(videoId);
    if (!savedVideo) throw new Error("Video not found after insertion");

    return savedVideo;
  }
});