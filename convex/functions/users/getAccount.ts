import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";
import { isPremium } from "./isPremium";

export const getAccount = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const userExtended = await ctx.db.query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId)).first();

  if (!userExtended) return null;

  const premium = await isPremium({ ...ctx, user: userExtended }, { throwOnReject: false });

  const { imageUrl, ...userExtendedWithoutImage } = userExtended;
  const image = imageUrl ?? user.image;

  const name = userExtended.name ?? user.name;

  return {
    ...userExtendedWithoutImage,
    ...user,
    image,
    name,
    _idExtended: userExtended._id,
    isPremium: premium
  };
}

export const getUserPublic = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId)).first();

  if (!user) return null;
  if (!user.username) return null;
  if (!user.name) return null;

  const premium = await isPremium({ ...ctx, user }, { throwOnReject: false });

  return {
    _id: userId,
    _creationTime: user._creationTime,
    name: user.name,
    username: user.username,
    image: user.imageUrl,
    isPremium: premium,
  }
}