"use node"
import { removeBackground } from "@/lib/runpod/node";
import { hasImageAlpha, imageBufferFromUrl } from "@shared/node/images";
import { v } from "convex/values";
import { authAction } from "../../procedures";

export const authed = authAction({
  args: {
    base64: v.optional(v.string()),
    url: v.optional(v.string()),
    nextStep: v.union(v.literal('SAVE_IMAGE'), v.literal('CREATE_ITEM')),
    nextArgs: v.optional(v.object({
      CREATE_ITEM: v.optional(v.object({
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        itemUrl: v.optional(v.string()),
      })),
    }))
  },
  handler: async (ctx, args) => {
    // If we have a base64 image, check if it has an alpha channel before starting the remove background task
    if (args.base64) {
      const buffer = await imageBufferFromUrl(args.base64);
      const hasAlpha = await hasImageAlpha(buffer);
      // If the image has an alpha channel, we can skip the background removal step and directly upload it
      if (hasAlpha) {
        return {
          completed: true,
          started: false,
          hasAlpha: true,
        }
      }
    }

    const result = await removeBackground({
      url: args.url,
      base64url: args.base64,
      callback: {
        userId: ctx.userId,
        nextStep: args.nextStep,
        nextArgs: args.nextArgs,
      }
    })

    return {
      completed: false,
      started: !!result,
      hasAlpha: false,
    };
  }
})