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

    const userIds = followers.page.map(follow => follow.followingId);
    const users = await Promise.all(userIds.map(async (userId) => {
      const appearance = await ctx.db.query("usersAppearance")
        .withIndex("by_user_id", q => q.eq("userId", userId))
        .first();

      if (!appearance) return null;
      if (!appearance.frontImageId) return null;

      return userId;
    }));

    const results = await Promise.all(users.filter(notEmpty)
      .filter((user) => user !== ctx.userId)
      .map((user) => getUserPublic(ctx, user)));

    return {
      ...followers,
      page: results.filter(notEmpty)
    }
  }
})