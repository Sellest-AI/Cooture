import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { createItem } from "../../functions/items/createItem";
import { authAction, internalMutation } from "../../procedures";
import { ITEMS_SCHEMA } from "../../schema/items";

export const authed = authAction({
  args: {
    imageId: v.id("images"),
  },
  handler: async (ctx, { imageId }) => {
    return createItem(ctx, {
      imageId,
      userId: ctx.userId,
    })
  }
});

export const _internal = internalAction({
  args: {
    imageId: v.id("images"),
    userId: v.id("users"),
  },
  handler: async (ctx, { imageId, userId }) => {
    return createItem(ctx, {
      imageId,
      userId,
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