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