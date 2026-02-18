import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { getItem } from "../../functions/items/getItem";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("items")
      .withIndex("by_user_id")
      .order("desc")
      .paginate(args.paginationOpts);

    const items = await Promise.all(results.page.map(async (item) => getItem(ctx, item._id)))

    return {
      ...results,
      page: items.filter(notEmpty)
    }
  }
})