import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { Doc, Id } from "../../../_generated/dataModel";
import { updateWaitlist } from "../../../functions/waitlist";
import { internalMutation, MutationCtx } from "../../../procedures";
import { NOTIFICATION_CHANNEL } from "../../../schema/notifications";

const sendNotifications = async (ctx: MutationCtx, userId: Id<'users'>) => {
  await ctx.scheduler.runAfter(0, internal.router.notifications.sendPushNotification._internal, {
    userId: userId,
    title: "Access granted 🔓",
    body: "You're officially off the waitlist. It's time to cook.",
    channelId: NOTIFICATION_CHANNEL["waitlist_approval"]
  });

  // send another notification after 48h to encourage users to use the app if they haven't already
  await ctx.scheduler.runAfter(1000 * 60 * 60 * 24 * 2,
    internal.router.notifications.sendPushNotification._internal, {
    userId: userId,
    title: "You're in 🤝",
    body: "We're ready for you. Your Cooture profile is officially live.",
    channelId: NOTIFICATION_CHANNEL["waitlist_approval"]
  })

  // send another notification after 24h to encourage users to use the app if they haven't already
  await ctx.scheduler.runAfter(1000 * 60 * 60 * 24 * 1,
    internal.router.notifications.sendPushNotification._internal, {
    userId: userId,
    title: "It's your turn 🪩",
    body: "Ready to serve? Go show everyone how to actually dress.",
    channelId: NOTIFICATION_CHANNEL["waitlist_approval"]
  })
}

const approveUsers = async (ctx: MutationCtx, userIds: Doc<'usersExtended'>[]) => {
  const users = await Promise.all(userIds.map(async (user) => {
    // only approve users who are in the waitlist
    if (user?.accountStatus !== 'WAITLIST') return false;
    await ctx.db.patch(user._id, { accountStatus: "ACTIVE" });
    await sendNotifications(ctx, user.userId);
    await updateWaitlist(ctx, { addUsersOut: 1 });
    return true;
  }));

  return users.filter(Boolean).length;
}

export const _internal = internalMutation({
  args: {
    amountToApprove: v.number(),
    userIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, { amountToApprove, userIds }) => {
    if (userIds && amountToApprove !== userIds.length) {
      throw new Error("Amount to approve must match the number of userIds provided");
    }

    if (userIds) {
      const users = await Promise.all(userIds.map(userId => ctx.db.query("usersExtended").withIndex("by_user_id", q => q.eq("userId", userId)).first()));
      const approvedCount = await approveUsers(ctx, users.filter(notEmpty));
      return `${approvedCount} users approved.`;
    }

    const users = await ctx.db.query("usersExtended")
      .withIndex("by_account_status", q => q.eq("accountStatus", "WAITLIST"))
      .order("asc")
      .take(Math.max(512, amountToApprove * 2))

    // Shuffle users and take the amount to approve
    const usersToApprove = users.sort(() => 0.5 - Math.random()).slice(0, amountToApprove);
    const approvedCount = await approveUsers(ctx, usersToApprove);
    return `${approvedCount} users approved.`;
  }
})