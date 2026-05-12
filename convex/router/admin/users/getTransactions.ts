import { v } from "convex/values";
import { adminQuery } from "../../../procedures";

export const admin = adminQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const transactionsFrom = await ctx.db.query('creditTransactions')
      .withIndex('by_from_id', q => q.eq('fromId', args.userId))
      .collect();

    const transactionsTo = await ctx.db.query('creditTransactions')
      .withIndex('by_to_id', q => q.eq('toId', args.userId))
      .collect();

    return {
      from: transactionsFrom,
      to: transactionsTo,
    }
  }
})