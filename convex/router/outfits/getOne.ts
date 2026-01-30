import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { getItem } from "../../functions/items/getItem";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, args) => {
    const [outfit, itemIds] = await Promise.all([
      ctx.db.get(args.outfitId),
      ctx.db.query('outfitItems')
        .withIndex('by_outfit_id', q => q.eq('outfitId', args.outfitId)).collect()
    ]);

    if (!outfit) return null;

    const _items = await Promise.all(itemIds.map(({ itemId }) => getItem(ctx, itemId)));
    const items = _items.filter(notEmpty);

    return {
      ...outfit,
      items,
      itemsCount: items.length,
    }
  }
})