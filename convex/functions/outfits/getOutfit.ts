import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";

type Outfit = Id<'outfits'> | Doc<'outfits'>;

export const getOutfit = async (ctx: QueryCtx, _outfit: Outfit) => {
  const outfit = typeof _outfit === 'string' ? await ctx.db.get('outfits', _outfit) : _outfit;
  if (!outfit) return null;

  const items = await ctx.db.query('outfitItems')
    .withIndex('by_outfit_id', q => q.eq('outfitId', outfit._id)).collect();

  const coverId = outfit.coverId ??
    (items[0] ? await ctx.db.get(items[0]?.itemId).then(item => item?.imageId) : undefined);

  if (!coverId) return null;
  const image = await getImage(ctx, coverId);
  if (!image) return null;

  return {
    ...outfit,
    items,
    itemsCount: items.length,
    cover: image
  }

}