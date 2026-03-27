"use node"
import { StorageCloud } from "@/lib/s3/node";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { internalAction } from "../../../_generated/server";

export const _internal = internalAction({
  args: { videoId: v.id("videos") },
  handler: async (ctx, { videoId }) => {
    const video = await ctx.runQuery(internal.router.storage.videos.getOne._internal, { id: videoId });
    if (!video) return null;

    await StorageCloud.deleteFile(video.key);

    await ctx.runMutation(internal.router.storage.videos.deleteOneMutationInternal._internal, { videoId });
  },
})

