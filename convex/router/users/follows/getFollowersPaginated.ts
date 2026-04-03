import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { publicQuery } from "../../../procedures";

export const anon = publicQuery({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const followers = await Promise.all(
      follows.page.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        if (!user) return null;
        return {
          _id: user._id,
          name: user.name,
          image: user.image
        };
      })
    );

    return {
      ...follows,
      page: followers.filter(notEmpty),
    };
  },
});
