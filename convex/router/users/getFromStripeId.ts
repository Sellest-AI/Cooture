import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";
import { Doc, Id } from "../../_generated/dataModel";

type UserExtended = Omit<Doc<'usersExtended'>, '_id' | '__tableName'> & { _idExtended: Id<'usersExtended'> };
type ReturnType = Promise<UserExtended & Doc<'users'>>;

export const _internal = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }): ReturnType => {
    const userExtended = await ctx.db.query("usersExtended")
      .withIndex("by_stripe_customer_id", (q) => q.eq('stripeCustomerId', stripeCustomerId))
      .first();

    if (!userExtended) throw new Error("User not found");

    const userId = userExtended.userId;
    const user = await ctx.db.get(userId);

    if (!user) throw new Error("User not found");

    return {
      ...userExtended,
      _idExtended: userExtended._id,
      ...user,
    };
  },
});