import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { internalAction, internalMutation, internalQuery } from "../../../_generated/server";

export const _internal = internalAction({
  handler: async (ctx) => {
    const items = await ctx.runQuery(internal.router.admin.items.fixColors._internal_query);

    let i = 0;

    await Promise.all(items.map(async (item) => {
      const { tags: colorTags, mainColors } = await ctx.runAction(internal.router.admin.items.fixColorsAction._internal_node, {
        imageUrl: item.imageUrl,
      });

      await ctx.runMutation(internal.router.admin.items.fixColors._internal_mutation, {
        id: item._id,
        colorTags,
        mainColors,
      });

      console.log(`Processed item ${i + 1} / ${items.length} (${item._id})`);

      i++;
    }));
  }
})

export const _internal_query = internalQuery({
  handler: async (ctx) => {
    const _items = await ctx.db.query("items").collect();
    const items = await Promise.all(_items.map(async (item) => {
      const image = await ctx.db.get(item.imageId);
      if (!image) { return null; }

      return {
        ...item,
        imageUrl: image.url,
      }
    }));

    return items.filter(notEmpty);
  }
})

export const _internal_mutation = internalMutation({
  args: {
    id: v.id("items"),
    mainColors: v.array(v.string()),
    colorTags: v.string(),
  },
  handler: async (ctx, { id, colorTags, mainColors }) => {
    await ctx.db.patch(id, {
      colorTags,
      mainColors,
    });
  }
});