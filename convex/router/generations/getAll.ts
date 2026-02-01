import { getGenerationDetails } from "../../functions/generations/getGenerationDetails";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {},
  handler: async (ctx) => {
    const generations = await ctx.db.query("generations")
      .withIndex("by_user_id", (q) => q.eq("userId", ctx.userId))
      .order("desc")
      .collect();

    return await Promise.all(generations.map(async g => ({
      ...g,
      ...(await getGenerationDetails(ctx, g._id))
    })));
  }
});