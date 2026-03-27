import { v } from "convex/values";
import { getVideo } from "../../../functions/videos";
import { internalQuery, publicQuery } from "../../../procedures";

export const anon = publicQuery({
  args: { id: v.id("videos") },
  handler: async (ctx, { id }) => {
    const video = await getVideo(ctx, id);
    if (!video) return null;
    return video;
  }
})

export const _internal = internalQuery({
  args: { id: v.id("videos") },
  handler: async (ctx, { id }) => {
    const video = await getVideo(ctx, id);
    if (!video) return null;
    return video;
  }
})