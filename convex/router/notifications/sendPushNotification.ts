"use node"
import { v } from "convex/values";
import { Expo } from "expo-server-sdk";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

const expo = new Expo();

export const _internal = internalAction({
  args: {
    channelId: v.string(),
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    image: v.optional(v.string()), // URL to image
    redirectUrl: v.optional(v.string()), // Deep link or screen to navigate to
    icon: v.optional(v.string()) // URL to icon
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.runQuery(internal.router.notifications.sendPushNotificationSteps._internal_step_1, { userId: args.userId });

    if (!tokens) return;

    const messages = tokens
      .filter(t => Expo.isExpoPushToken(t))
      .map(t => ({
        to: t,
        title: args.title.trim(),
        body: args.body.trim(),
        data: args.redirectUrl ? { ...args.data, url: args.redirectUrl } : args.data,
        sound: "default" as const,
        channelId: args.channelId,
        ...(args.image && { richContent: { image: args.image } }), // Add image if provided
        ...(args.icon && { icon: args.icon }) // Add icon if provided
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
