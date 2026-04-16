import { getTagsFromHexColors } from "@/lib/color";
import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getItem } from "../../functions/items";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    hexColor: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const tags = getTagsFromHexColors([args.hexColor]);
    const cleanedColor = tags[0]?.toLowerCase().trim().replaceAll(' ', '_') || '';

    const results = await ctx.db.query("items")
      .withSearchIndex("search_colors", (q) => q.search('colorTags', cleanedColor))
      .paginate(args.paginationOpts);

    const items = await Promise.all(results.page.map((item) => getItem(ctx, item)));

    return {
      ...results,
      page: items.filter(notEmpty),
    };
  }
})