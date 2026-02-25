"use node"
import { v } from "convex/values";
import { Expo } from "expo-server-sdk";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { NOTIFICATION_CHANNEL, NOTIFICATION_TYPE } from "../../schema/notifications";

const expo = new Expo();

export const _internal = internalAction({
  args: {
    type: NOTIFICATION_TYPE,
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.runQuery(internal.router.notifications.sendPushNotificationSteps._internal_step_1, { userId: args.userId });

    if (!tokens) return;

    const channel = NOTIFICATION_CHANNEL[args.type] || "social";

    const messages = tokens
      .filter(t => Expo.isExpoPushToken(t))
      .map(t => ({
        to: t,
        title: args.title,
        body: args.body,
        data: args.data,
        sound: "default" as const,
        channelId: channel
      }));

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        // optionally handle receipts to detect invalid tokens
        for (const receipt of receipts) {
          if (receipt.status === "error") {
            console.error("Push error:", receipt.message);
            // if DeviceNotRegistered, delete the token from DB
            if (receipt.details?.error === "DeviceNotRegistered") {
              await ctx.runMutation(internal.router.notifications.sendPushNotificationSteps._internal_step_2, {
                token: chunk[receipts.indexOf(receipt)].to as string
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
})
