import { getNotificationDetails } from "../../functions/notifications";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", ctx.userId).eq("read", false))
      .order("desc")
      .collect();

    return await Promise.all(notifications.map(async (notification) => {
      return getNotificationDetails(ctx, notification);
    }));
  }
})