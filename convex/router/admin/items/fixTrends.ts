import { internal } from "../../../_generated/api";
import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").order('desc').take(50);

    for (const item of items) {
      if (item.trendTags) continue;
      await ctx.scheduler.runAfter(0, internal.router.items.createOne._internal_trend_action, {
        itemId: item._id,
      });
    }
  }
})