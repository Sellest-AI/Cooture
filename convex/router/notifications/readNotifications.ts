import { v } from "convex/values";
import { authMutation, internalMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    notificationIds: v.array(v.id("notifications"))
  },
  handler: async ({ db }, { notificationIds }) => {
    await Promise.all(notificationIds.map(id => db.patch(id, { read: true })));
  }
})

export const _internal = internalMutation({
  args: {
    notificationIds: v.array(v.id("notifications"))
  },
  handler: async ({ db }, { notificationIds }) => {
    await Promise.all(notificationIds.map(id => db.patch(id, { read: true })));
  }
})