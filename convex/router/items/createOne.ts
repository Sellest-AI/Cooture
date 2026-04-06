import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { createItem } from "../../functions/items/createItem";
import { adminAction, authAction, internalMutation } from "../../procedures";
import { ITEMS_SCHEMA } from "../../schema/items";

const sharedArgs = {
  imageId: v.id("images"),
  metadata: v.optional(v.object({
    brand: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    itemUrl: v.optional(v.string()),
  })),
}

export const authed = authAction({
  args: sharedArgs,
  handler: async (ctx, { imageId, metadata }) => {
    return createItem(ctx, {
      imageId,
      userId: ctx.userId,
      metadata,
    })
  }
});

export const admin = adminAction({
  args: { ...sharedArgs, userId: v.id("users") },
  handler: async (ctx, { imageId, userId, metadata }) => {
    return createItem(ctx, {
      imageId,
      userId,
      metadata,
    })
  }
})

export const _internal = internalAction({
  args: {
    ...sharedArgs,
    userId: v.id("users"),
  },
  handler: async (ctx, { imageId, userId, metadata }) => {
    return createItem(ctx, {
      imageId,
      userId,
      metadata,
    })
  }
})

const mutationArgs = {
  ...ITEMS_SCHEMA,
  userId: v.id("users"),
};

export const _internal_mutation = internalMutation({
  args: mutationArgs,
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert("items", args);
    return itemId;
  }
})