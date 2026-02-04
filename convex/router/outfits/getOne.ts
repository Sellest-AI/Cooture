import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getItem } from "../../functions/items/getItem";
import { internalQuery, publicQuery, QueryCtx } from "../../procedures";

const getOutfit = async (ctx: QueryCtx, outfitId: Id<'outfits'>) => {
  const [outfit, itemIds] = await Promise.all([
    ctx.db.get(outfitId),
    ctx.db.query('outfitItems')
      .withIndex('by_outfit_id', q => q.eq('outfitId', outfitId)).collect()
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

export const anon = publicQuery({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, args) => {
    return getOutfit(ctx, args.outfitId);
  }
})

export const _internal = internalQuery({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, args) => {
    return getOutfit(ctx, args.outfitId);
  }
})