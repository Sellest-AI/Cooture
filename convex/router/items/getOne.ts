import { v } from "convex/values";
import { getItem } from "../../functions/items/getItem";
import { internalQuery, publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    return getItem(ctx, itemId);
  }
})

export const _internal = internalQuery({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    return getItem(ctx, itemId);
  }
})