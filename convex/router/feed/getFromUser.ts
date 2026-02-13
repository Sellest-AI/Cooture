import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    const generations = await ctx.db.query('generations')
      .withIndex('by_publication_status_and_user_id', (q) =>
        q.eq('publication', 'PUBLISHED').eq('userId', userId))
      .order('desc')
      .collect();

    return generations;
  }
})