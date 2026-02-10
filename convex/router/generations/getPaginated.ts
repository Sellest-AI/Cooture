import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getGenerationDetails } from "../../functions/generations";
import { authQuery, publicQuery } from "../../procedures";

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


export const anon = publicQuery({
  args: {
    userId: v.id('users'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts, userId }) => {
    const result = await ctx.db.query("generations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .filter(q => q.eq(q.field("status"), "COMPLETED"))
      .paginate(paginationOpts);

    const generations = await Promise.all(result.page.map(async g => {
      const details = await getGenerationDetails(ctx, g._id);
      const predictions = details.predictions.filter(p => p.status === 'ACCEPTED');

      return {
        ...g,
        ...details,
        predictions
      }
    }));

    return {
      ...result,
      page: generations
    }
  }
})