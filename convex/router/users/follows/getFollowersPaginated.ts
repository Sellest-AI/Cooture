import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getUserPublic } from "../../../functions/users";
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
      follows.page.map(async (follow) =>
        getUserPublic(ctx, follow.followerId)));

    return {
      ...follows,
      page: followers.filter(notEmpty),
    };
  },
});
