"use node"
import { removeBackground } from "@/lib/runpod/node";
import { hasImageAlpha, imageBufferFromUrl } from "@shared/node/images";
import { Infer, v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";
import { ActionCtx, adminAction, authAction } from "../../procedures";

const args = {
  base64: v.optional(v.string()),
  url: v.optional(v.string()),
  nextStep: v.union(v.literal('SAVE_IMAGE'), v.literal('CREATE_ITEM'), v.literal('UPDATE_ITEM')),
  nextArgs: v.optional(v.object({
    UPDATE_ITEM: v.optional(v.object({
      itemId: v.id("items"),
    })),
    CREATE_ITEM: v.optional(v.object({
      brand: v.optional(v.string()),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      itemUrl: v.optional(v.string()),
    })),
  }))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const argsObject = v.object(args);
type Args = Infer<typeof argsObject> & { userId: Id<'users'> };

const handler = async (ctx: ActionCtx, args: Args) => {
  const url = args.url ?? args.base64;
  if (!url) throw new Error("Either base64 or url must be provided");

  // If we have a base64 image, check if it has an alpha channel before starting the remove background task
  const buffer = await imageBufferFromUrl(url);
  const hasAlpha = await hasImageAlpha(buffer);

  // If the image has an alpha channel, we can skip the background removal step and directly upload it
  if (hasAlpha) {
    await ctx.runAction(internal.http.runpod.removeBackground._internal_process, {
      removeBackgroundData: {
        url: url,
        callback: {
          userId: args.userId,
          nextStep: args.nextStep,
          nextArgs: args.nextArgs,
        }
      }
    })

    return {
      completed: true,
      started: false,
      hasAlpha: true,
    }
  }

  const result = await removeBackground({
    url: args.url,
    base64url: args.base64,
    callback: {
      userId: args.userId,
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

export const admin = adminAction({
  args: { ...args, userId: v.id("users") },
  handler: (ctx, args) => handler(ctx, args)
})

export const _internal = internalAction({
  args: { ...args, userId: v.id("users") },
  handler: (ctx, args) => handler(ctx, args)
})

export const authed = authAction({
  args: args,
  handler: async (ctx, args) => {
    return handler(ctx, { ...args, userId: ctx.userId });
  }
})