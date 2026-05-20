import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { createItem } from "../../functions/items/createItem";
import { adminAction, authAction, internalMutation } from "../../procedures";
import { ITEMS_SCHEMA } from "../../schema/items";

const sharedArgs = {
  imageId: v.id("images"),
  metadata: v.optional(v.object({
    brand: v.optional(v.string()),
    name: v.optional(v.string()),
    gender: v.optional(v.string()),
    fit: v.optional(v.string()),
    materials: v.optional(v.array(v.string())),
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

export const _internal_trend_action = internalAction({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.runQuery(internal.router.items.getOne._internal, { itemId });
    if (!item) throw new Error("Item not found");

    const trends = await ctx.runAction(internal.llm.triggers.trendExtractor._internal, {
      items: [{
        name: item.name,
        brand: item.brand,
        description: item.description,
        features: item.features,
        category: item.category,
        weatherTags: item.weatherTags,
        mainColors: item.mainColors,
        colorTones: item.colorTones,
        materialFeel: item.materialFeel,
        materials: item.materials,
        // ⚠️ We don't share styles because they can be wrongly interpreted as trends by the model.
        // styles: item.styles,
      }]
    });

    await ctx.runMutation(internal.router.items.editOne._internal, {
      itemId,
      trends: trends.filter((t) => t.confidence > 0.7).map((t) => t.trend),
    });
  }
});