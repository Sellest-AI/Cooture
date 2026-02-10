import { v } from "convex/values";
import { getGenerationDetails } from "../../functions/generations";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    const result = await ctx.db.query("generations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .filter(q => q.eq(q.field("status"), "COMPLETED"))
      .collect();

    const generations = await Promise.all(result.map(async g => {
      const details = await getGenerationDetails(ctx, g._id);
      const predictions = details.predictions.filter(p => p.status === 'ACCEPTED');

      return {
        ...g,
        ...details,
        predictions
      }
    }));

    return generations;
  }
})