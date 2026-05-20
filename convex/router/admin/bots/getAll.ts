import { notEmpty } from "@shared/utils";
import { getUserPublic } from "../../../functions/users";
import { internalQuery, QueryCtx } from "../../../procedures";

const handler = async (ctx: QueryCtx) => {
  const bots = await ctx.db.query("bots").order("desc").collect();

  const users = await Promise.all(bots.map((bot) => getUserPublic(ctx, bot.userId)));

  return users.filter(notEmpty);
}

export const _internal = internalQuery({
  handler: async (ctx) => handler(ctx),
})

