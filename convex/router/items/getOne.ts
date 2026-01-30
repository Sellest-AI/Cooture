import { v } from "convex/values";
import { getItem } from "../../functions/items/getItem";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    return getItem(ctx, itemId);
  }
})