import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";

export const getItem = async (ctx: QueryCtx, itemId: Id<'items'>) => {
  const item = await ctx.db.get(itemId);
  if (!item) return null;
  const image = await getImage(ctx, item?.imageId);
  if (!image) return null;
  return {
    ...item,
    image,
  }
}