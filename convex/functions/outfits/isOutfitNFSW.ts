import { notEmpty } from "@shared/utils";
import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { extractPosition } from "../items/extractPosition";

export type ContentRating = Doc<'items'>['contentRating'];

const extractDefaultRating = (items: Doc<'items'>[]): ContentRating => {
  const contentRatings = items.map(i => i.contentRating);
  let contentRating: ContentRating = 'SAFE';

  if (contentRatings.filter((r) => r === 'SUGGESTIVE').length >= 2) contentRating = 'SUGGESTIVE';
  if (contentRatings.filter((r) => r === 'EXPLICIT').length >= 1) contentRating = 'SUGGESTIVE';
  if (contentRatings.filter((r) => r === 'EXPLICIT').length >= 2) contentRating = 'EXPLICIT';
  if (contentRatings.includes('NSFW')) contentRating = 'NSFW';

  return contentRating;
}

const compareRatings = (r1: ContentRating, operation: '>' | '>=', r2: ContentRating): ContentRating => {
  const ratings = ['SAFE', 'SUGGESTIVE', 'EXPLICIT', 'NSFW'];
  const r1Index = ratings.indexOf(r1);
  const r2Index = ratings.indexOf(r2);
  if (operation === '>')
    return r1Index > r2Index ? r1 : r2;
  return r1Index >= r2Index ? r1 : r2;
}

export const isOutfitNFSW = async (ctx: QueryCtx, itemIds: Id<'items'>[]) => {
  const items = (await Promise.all(itemIds.map(id => ctx.db.get('items', id))))
    .filter(notEmpty);

  let contentRating = extractDefaultRating(items);

  const outerwear = items.find((i) => extractPosition(i.category) === 'OUTERWEAR');
  const top = items.find((i) => extractPosition(i.category) === 'TOP');
  const innerLayer = items.find((i) => extractPosition(i.category) === 'INNERLAYER');

  if (outerwear?.contentRating === 'NSFW') contentRating = 'NSFW';
  if (top?.contentRating === 'NSFW') contentRating = 'NSFW';
  // If the inner layer is NSFW, but there is no top or outerwear, then the outfit is NSFW
  if (innerLayer?.contentRating === 'NSFW' && !top && !outerwear) contentRating = 'NSFW';

  const bottom = items.find((i) => extractPosition(i.category) === 'BOTTOM');
  const legwear = items.find((i) => extractPosition(i.category) === 'LEGWEAR');

  // If no bottom is present, but there is legwear that is EXPLICIT or worse, then the outfit is NSFW
  if (!bottom && legwear && compareRatings(legwear?.contentRating, '>=', 'EXPLICIT'))
    contentRating = 'NSFW';

  return contentRating;
}