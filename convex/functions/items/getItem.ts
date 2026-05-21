import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";
import { extractPosition } from "./extractPosition";

export const getItem = async (ctx: QueryCtx, item: Id<'items'> | Doc<'items'>) => {
  const _item = typeof item === "string" ? await ctx.db.get(item) : item;
  if (!_item) return null;
  const image = await getImage(ctx, _item.imageId);
  if (!image) return null;
  return {
    ..._item,
    position: extractPosition(_item.category),
    price: _item.price ? {
      amount: _item.price / 100,
      amountCents: _item.price,
      currency: _item.currency!,
    } : undefined,
    image,
  }
}