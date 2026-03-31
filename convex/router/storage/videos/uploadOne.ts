"use node"
import { StorageCloud } from "@/lib/s3/node";
import { notEmpty } from "@shared/utils";
import { Infer, v } from "convex/values";
import { internal } from "../../../_generated/api";
import { Doc, Id } from "../../../_generated/dataModel";
import { internalAction } from "../../../_generated/server";
import { VIDEO_TAGS } from "../../../schema/videos";

/**
 * Fetch video from URL and convert to buffer (for small files only)
 * WARNING: Only use this for videos smaller than 50MB to prevent memory issues
 */
const fetchVideoAsBuffer = async (url: string): Promise<{ buffer: Buffer; mimeType: string }> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    // Check content length to prevent loading huge files
    const contentLength = response.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength, 10) : 0;

    // Limit to 50MB for buffer approach
    const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50MB
    if (size > MAX_BUFFER_SIZE) {
      throw new Error(`Video too large for buffer approach: ${(size / 1024 / 1024).toFixed(2)}MB. Use streaming instead.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get mime type from response headers or default to video/mp4
    // if it's an octet-stream, we assume mp4
    let mimeType = response.headers.get('content-type') || 'video/mp4';
    if (mimeType.includes('octet-stream')) mimeType = 'video/mp4';

    return { buffer, mimeType };
  } catch (error) {
    throw new Error(`Failed to fetch video from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

type VideoTags = Infer<typeof VIDEO_TAGS>[number];

type Data = {
  userId: Id<'users'> | null,
  tags?: VideoTags[],
  dimensions: { width: number, height: number },
  durationMs: number,
  fps: number,
}

const uploadFileToS3 = async (url: string, data: Data) => {
  const folder = data.userId ? StorageCloud.FOLDERS.USER(data.userId) : StorageCloud.FOLDERS.PUBLIC;

  const { buffer, mimeType } = await fetchVideoAsBuffer(url);

  const videoFile = {
    buffer,
    mimeType: mimeType,
  };

  const uploadedFile = await StorageCloud.uploadFile(videoFile, folder);

  const tagsSet: Set<VideoTags> = new Set([
    'VIDEO' as const,
    ...(data.tags ?? [])])

  const sanitizedTags: VideoTags[] = Array.from(tagsSet).filter(notEmpty);

  const size = buffer.length;
  const format = mimeType.split('/')[1] || 'mp4'; // Default to mp4 if unknown

  return {
    url: uploadedFile.location,
    key: uploadedFile.key,
    width: data.dimensions.width,
    height: data.dimensions.height,
    size: size,
    mimeType: mimeType,
    durationMs: data.durationMs,
    fps: data.fps,
    format: format,
    tags: sanitizedTags,
  }
}

const args = {
  userId: v.union(v.id("users"), v.null()),
  dimensions: v.object({ width: v.number(), height: v.number() }),
  durationMs: v.number(),
  baseImageId: v.optional(v.id("images")),
  tags: v.optional(VIDEO_TAGS),
  tmpKey: v.optional(v.string()),
  url: v.string(),
  fps: v.number(),
}

export const _internal = internalAction({
  args: args,
  handler: async (ctx, args): Promise<Doc<'videos'>> => {
    const video = await uploadFileToS3(args.url, args);

    const savedVideo = await ctx.runMutation(internal.router.storage.videos.saveOne._internal, {
      userId: args.userId,
      url: video.url,
      key: video.key,
      mimeType: video.mimeType,
      durationMs: video.durationMs,
      fps: video.fps,
      format: video.format,
      tags: video.tags,
      size: video.size,
      thumbnailId: args.baseImageId,
      dimensions: {
        width: video.width,
        height: video.height,
      },
    })

    if (args.tmpKey) {
      await StorageCloud.deleteFile(args.tmpKey).catch(() => null);
      // Delete associated thumbnail if exists
      await StorageCloud.deleteFile(args.tmpKey.replaceAll('.mp4', '.png')).catch(() => null);
    }

    return savedVideo;
  }
});
