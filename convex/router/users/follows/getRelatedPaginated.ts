import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { getUserPublic } from "../../../functions/users";
import { authQuery } from "../../../procedures";

export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const followers = await ctx.db.query("follows")
      .withIndex("by_follower", q => q.eq("followerId", ctx.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const loadMore = followers.isDone && followers.page.length < 21;
    const result = loadMore ? await ctx.db.query("users").order("desc")
      .take(21) : [];

    const users = await Promise.all(Array.from(new Set([
      ...followers.page.map(follow => follow.followingId),
      ...result.map(user => user._id),
    ]))
      .filter((user) => user !== ctx.userId)
      .map((user) => getUserPublic(ctx, user)))

    return {
      ...followers,
      page: users.filter(notEmpty)
    }
  }
})