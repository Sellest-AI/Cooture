import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getGenerationDetails } from "../../functions/generations";
import { adminQuery, authQuery, publicQuery, QueryCtx } from "../../procedures";

const authedHandler = async (ctx: QueryCtx, userId: Id<'users'>, paginationOpts: typeof paginationOptsValidator.type) => {
  const result = await ctx.db.query("generations")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .order("desc")
    .paginate(paginationOpts);

  const generations = await Promise.all(result.page.map(async g => ({
    ...g,
    ...(await getGenerationDetails(ctx, g._id)),
  })));

  return {
    ...result,
    page: generations
  }
}

export const authed = authQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => authedHandler(ctx, ctx.userId, paginationOpts)
})

export const admin = adminQuery({
  args: { userId: v.id('users'), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { userId, paginationOpts }) => authedHandler(ctx, userId, paginationOpts)
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
      .filter(q => q.eq(q.field("publication"), "PUBLISHED"))
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