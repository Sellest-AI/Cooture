import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";

export const getPortraits = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const portraits = await ctx.db.query("userPortraits").withIndex("by_user_id", (q) =>
    q.eq("userId", userId)).first();

  if (!portraits) { return null; }

  const [frontImage, sideImage, smileImage] = await Promise.all([
    getImage(ctx, portraits.frontImageId),
    getImage(ctx, portraits.sideImageId),
    getImage(ctx, portraits.smileImageId),
  ])

  if (!frontImage || !sideImage || !smileImage) { return null; }

  return {
    _id: portraits._id,
    frontImage,
    sideImage,
    smileImage,
  };
}