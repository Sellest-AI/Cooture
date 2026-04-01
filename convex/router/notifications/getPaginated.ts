import { paginationOptsValidator } from "convex/server";
import { getNotificationDetails } from "../../functions/notifications";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", ctx.userId).eq("read", true))
      .order("desc")
      .paginate(args.paginationOpts);

    const notifications = await Promise.all(result.page.map(async (notification) => {
      return getNotificationDetails(ctx, notification);
    }));

    return {
      ...result,
      page: notifications,
    }
  }
})