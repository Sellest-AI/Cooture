import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage, GetImageDoc } from "../images";

type Appearance = Doc<'usersAppearance'> & {
  frontImage?: GetImageDoc,
  sideImage?: GetImageDoc,
  smileImage?: GetImageDoc,
}

export const getAppearance = async (ctx: QueryCtx, userId: Id<'users'>): Promise<Appearance | null> => {
  const appearance = await ctx.db.query("usersAppearance").withIndex("by_user_id", (q) =>
    q.eq("userId", userId)).first();

  if (!appearance) { return null; }

  if (!appearance.frontImageId || !appearance.sideImageId || !appearance.smileImageId) {
    return { ...appearance };
  }

  const [frontImage, sideImage, smileImage] = await Promise.all([
    getImage(ctx, appearance.frontImageId),
    getImage(ctx, appearance.sideImageId),
    getImage(ctx, appearance.smileImageId),
  ])

  if (!frontImage || !sideImage || !smileImage) {
    return { ...appearance };
  }

  return {
    ...appearance,
    frontImage,
    sideImage,
    smileImage,
  };
}