import { internal } from "../../../_generated/api";
import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  handler: async (ctx) => {
    const outfits = await ctx.db.query("outfits").collect();

    let i = 0;
    for (const outfit of outfits) {
      i = i + 1;
      const delay = i * 500; // delay each update by 500ms to avoid overwhelming the server
      await ctx.scheduler.runAfter(delay, internal.router.outfits.updateCover._internal, { outfitId: outfit._id });
      console.log(`Scheduled cover update for outfit ${outfit._id} with delay of ${delay}ms. (${i}/${outfits.length})`);
    }
  }
})