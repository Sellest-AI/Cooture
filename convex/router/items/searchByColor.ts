import { getTagsFromHexColors } from "@/lib/color";
import { convertTagsToString, sanitizeTag } from "@/lib/helpers";
import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getItem } from "../../functions/items";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    hexColor: v.string(),
    extraHexColors: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const tags = getTagsFromHexColors([args.hexColor, ...(args.extraHexColors || [])]);
    const cleanedColors = convertTagsToString(tags);

    const results = await ctx.db.query("items")
      .withSearchIndex("search_colors", (q) => q.search('colorTags', cleanedColors))
      .paginate(args.paginationOpts);

    const items = await Promise.all(results.page
      .filter((item) => {
        if (!args.category) return true;
        return sanitizeTag(item.category) === sanitizeTag(args.category);
      })
      .map((item) => getItem(ctx, item._id)));

    return {
      ...results,
      page: items.filter(notEmpty),
    };
  }
})