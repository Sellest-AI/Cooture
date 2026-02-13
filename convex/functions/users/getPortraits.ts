import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";

export const getPortraits = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const appearance = await ctx.db.query("usersAppearance").withIndex("by_user_id", (q) =>
    q.eq("userId", userId)).first();

  if (!appearance) { return null; }

  const [frontImage, sideImage, smileImage] = await Promise.all([
    getImage(ctx, appearance.frontImageId),
    getImage(ctx, appearance.sideImageId),
    getImage(ctx, appearance.smileImageId),
  ])

  if (!frontImage || !sideImage || !smileImage) { return null; }

  return {
    ...appearance,
    frontImage,
    sideImage,
    smileImage,
  };
}