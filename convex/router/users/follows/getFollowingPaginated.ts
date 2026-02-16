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
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const following = await Promise.all(
      follows.page.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        return user;
      })
    );

    return {
      ...follows,
      page: following.filter(notEmpty),
    };
  },
});
