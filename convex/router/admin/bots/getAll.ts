import { notEmpty } from "@shared/utils";
import { getUserPublic } from "../../../functions/users";
import { adminQuery } from "../../../procedures";

export const admin = adminQuery({
  handler: async (ctx) => {
    const bots = await ctx.db.query("bots").order("desc").collect();

    const users = await Promise.all(bots.map((bot) => getUserPublic(ctx, bot.userId)));

    return users.filter(notEmpty);
  }
})