import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { getVideo } from "../../../functions/videos";
import { publicQuery } from "../../../procedures";

const args = {
  videoIds: v.array(v.id('videos')),
}

export const anon = publicQuery({
  args, handler: async (ctx, args) => {
    const videos = await Promise.all(Array.from(new Set(args.videoIds)).map(id => getVideo(ctx, id)));
    return videos.filter(notEmpty);
  }
});