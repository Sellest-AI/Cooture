import { v } from "convex/values";
import { authMutation, internalMutation } from "../../procedures";

/**
 * The authenticated variant used to patch every id it was handed, so any signed-in user
 * could mark another user's notifications read (03-FLAWS F6). Ids that do not belong to
 * the caller are now skipped rather than rejected, so a stale client list still works.
 */
export const authed = authMutation({
  args: {
    notificationIds: v.array(v.id("notifications"))
  },
  handler: async (ctx, { notificationIds }) => {
    await Promise.all(notificationIds.map(async (id) => {
      const notification = await ctx.db.get(id);
      if (!notification || notification.userId !== ctx.userId) return;
      await ctx.db.patch(id, { read: true });
    }));
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