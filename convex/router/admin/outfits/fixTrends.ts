import { internal } from "../../../_generated/api";
import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  handler: async (ctx) => {
    const outfits = await ctx.db.query("outfits").order('desc').collect();

    for (const outfit of outfits) {
      await ctx.scheduler.runAfter(0, internal.router.outfits.updateTags._internal, { outfitId: outfit._id });
    }
  }
})