import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  handler: async (ctx) => {
    const predictions = await ctx.db.query('predictions')
      .withIndex('status', (q) => q.eq('status', 'ACCEPTED')).order('desc')
      .take(20);

    return predictions.map((p) => p._id);
  }
})