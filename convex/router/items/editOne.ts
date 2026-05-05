import { convertTagsToString } from "@/lib/helpers";
import { removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { isAuthorized } from "../../functions/users";
import { authMutation, internalMutation } from "../../procedures";
import { ITEM_CATEGORIES, ITEM_COLOR_TONES, ITEM_GENDERS, ITEM_MATERIAL_FEEL, ITEM_WEATHERS } from "../../schema/items";

export const authed = authMutation({
  args: {
    itemId: v.id("items"),
    category: v.optional(ITEM_CATEGORIES),
    weatherTags: v.optional(v.array(ITEM_WEATHERS)),
    colorTones: v.optional(v.array(ITEM_COLOR_TONES)),
    materialFeel: v.optional(ITEM_MATERIAL_FEEL),
    gender: v.optional(ITEM_GENDERS),
  },
  handler: async (ctx, args) => {
    // Ensure the user own the item
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    await isAuthorized(ctx, item);

    const data = {
      ...args,
      // weatherTags: args.weatherTags ? Array.from(new Set(args.weatherTags)) : undefined,
      // colorTones: args.colorTones ? Array.from(new Set(args.colorTones)) : undefined,
      weatherTags: args.weatherTags ? [args.weatherTags[0]] : undefined,
      colorTones: args.colorTones ? [args.colorTones[0]] : undefined,
    }

    const { itemId, ...rest } = data;
    const fields = removeUndefinedKeys(rest);

    return ctx.db.patch(itemId, fields);
  }
})

export const _internal = internalMutation({
  args: {
    itemId: v.id("items"),
    trends: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    // We merge the existing styles with the trends
    const mergedTrends = [...item.styles, ...(args.trends ?? [])]
    const trendTags = convertTagsToString(mergedTrends);
    const trendTagsString = trendTags.length > 0 ? trendTags : undefined;

    const fields = removeUndefinedKeys({
      trendTags: trendTagsString,
    })

    return ctx.db.patch(args.itemId, fields);
  }
})