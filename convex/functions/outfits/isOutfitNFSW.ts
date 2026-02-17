import { notEmpty } from "@shared/utils";
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { extractPosition } from "../items/extractPosition";

export const isOutfitNFSW = async (ctx: QueryCtx, itemIds: Id<'items'>[]) => {
  const items = (await Promise.all(itemIds.map(id => ctx.db.get('items', id))))
    .filter(notEmpty);

  let isNSFW = false;

  const outerwear = items.find((i) => extractPosition(i.category) === 'OUTERWEAR');
  const top = items.find((i) => extractPosition(i.category) === 'TOP');
  const innerLayer = items.find((i) => extractPosition(i.category) === 'INNERLAYER');

  if (outerwear?.isNFSW) isNSFW = true;
  if (top?.isNFSW) isNSFW = true;
  // If the inner layer is NSFW, but there is no top or outerwear, then the outfit is NSFW
  if (innerLayer?.isNFSW && !top && !outerwear) isNSFW = true;

  return isNSFW;
}