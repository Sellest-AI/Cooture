import { notEmpty } from "@shared/utils";
import { getUserPublic } from "../../../functions/users";
import { adminQuery, internalQuery, QueryCtx, serverQuery } from "../../../procedures";

const handler = async (ctx: QueryCtx) => {
  const bots = await ctx.db.query("bots").order("desc").collect();

  const users = await Promise.all(bots.map((bot) => getUserPublic(ctx, bot.userId)));
  const appearances = await Promise.all(bots.map((bot) => ctx.db.query("usersAppearance")
    .withIndex('by_user_id', (q) => q.eq('userId', bot.userId)).first()));

  return users.map((user) => {
    if (!user) return null;

    const appearance = appearances.find((appearance) => appearance?.userId === user._id);
    if (!appearance) return null;

    return {
      ...user,
      appearance,
    }
  }).filter(notEmpty);
}

export const _internal = internalQuery({
  handler: async (ctx) => handler(ctx),
})

export const admin = adminQuery({
  handler: async (ctx) => handler(ctx),
})

export const server = serverQuery({
  args: {},
  handler: async (ctx) => handler(ctx),
})
