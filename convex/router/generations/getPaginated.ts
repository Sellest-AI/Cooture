import { paginationOptsValidator } from "convex/server";
import { getGenerationDetails } from "../../functions/generations";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const result = await ctx.db.query("generations")
      .withIndex("by_user_id", (q) => q.eq("userId", ctx.userId))
      .order("desc")
      .paginate(paginationOpts);

    const generations = await Promise.all(result.page.map(async g => ({
      ...g,
      ...(await getGenerationDetails(ctx, g._id))
    })));

    return {
      ...result,
      page: generations
    }
  }
})