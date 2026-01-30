import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { getItem } from "../../functions/items/getItem";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    itemIds: v.array(v.id("items")),
  },
  handler: async (ctx, { itemIds }) => {
    const items = await Promise.all(itemIds.map(itemId => getItem(ctx, itemId)));
    return items.filter(notEmpty);
  }
})