import { v } from "convex/values";
import { getVideo } from "../../../functions/videos";
import { internalMutation } from "../../../procedures";

/** 
 * INTERNAL ONLY. Do not call directly. Use deleteOne action instead.
 */
export const _internal = internalMutation({
  args: {
    videoId: v.id("videos")
  },
  handler: async (ctx, { videoId }) => {
    const video = await getVideo(ctx, videoId);
    if (!video) return;

    await ctx.db.delete(videoId);

    let videoUsers = await ctx.db.query("userVideos")
      .withIndex("by_video_id", (q) => q.eq("videoId", videoId)).collect();
    for await (const videoUser of videoUsers) {
      await ctx.db.delete("userVideos", videoUser._id);
    }
  },
})