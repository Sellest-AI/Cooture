import { notEmpty } from "@shared/utils";
import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { extractPosition } from "../items/extractPosition";

export type ContentRating = Doc<'items'>['contentRating'];

export const isOutfitNFSW = async (ctx: QueryCtx, itemIds: Id<'items'>[]) => {
  const items = (await Promise.all(itemIds.map(id => ctx.db.get('items', id))))
    .filter(notEmpty);

  let contentRating: ContentRating = 'SAFE';

  const outerwear = items.find((i) => extractPosition(i.category) === 'OUTERWEAR');
  const top = items.find((i) => extractPosition(i.category) === 'TOP');
  const innerLayer = items.find((i) => extractPosition(i.category) === 'INNERLAYER');

  if (outerwear?.contentRating === 'NSFW') contentRating = 'NSFW';
  if (top?.contentRating === 'NSFW') contentRating = 'NSFW';
  // If the inner layer is NSFW, but there is no top or outerwear, then the outfit is NSFW
  if (innerLayer?.contentRating === 'NSFW' && !top && !outerwear) contentRating = 'NSFW';

  return contentRating;
}