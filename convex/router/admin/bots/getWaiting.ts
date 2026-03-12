import { getUserPublic } from "../../../functions/users";
import { adminQuery } from "../../../procedures";

export const admin = adminQuery({
  handler: async (ctx) => {
    const results = await ctx.db.query('bots')
      .order("desc").take(1024);

    const bots = await Promise.all(results.map(async (r) => {
      const latestGeneration = await ctx.db.query('generations')
        .withIndex('by_user_id', (q) => q.eq('userId', r.userId)).first();

      const user = await getUserPublic(ctx, r.userId);

      const lastGeneratedAt = latestGeneration ? latestGeneration._creationTime : -1;
      return {
        ...r,
        user,
        lastGeneratedAt,
        latestGeneration,
      }
    }));

    return bots;
  }
})