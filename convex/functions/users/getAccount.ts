import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

export const getAccount = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const userExtended = await ctx.db.query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId)).first();

  if (!userExtended) return null;

  return { ...userExtended, ...user };
}

export const getUserPublic = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId)).first();

  if (!user) return null;
  if (!user.username) return null;
  if (!user.name) return null;

  return {
    _id: userId,
    _creationTime: user._creationTime,
    name: user.name,
    username: user.username,
    image: user.imageUrl,
  }
}