import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    notificationIds: v.array(v.id("notifications"))
  },
  handler: async ({ db }, { notificationIds }) => {
    await Promise.all(notificationIds.map(id => db.patch(id, { read: true })));
  }
})