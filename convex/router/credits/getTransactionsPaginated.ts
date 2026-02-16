import { paginationOptsValidator } from "convex/server";
import { authQuery } from "../../procedures";

/**
 * Get transaction history for the authenticated user
 * Returns paginated list of credit transactions
 */
export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Get transactions where user is the recipient (toId)
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_to_id", (q) => q.eq("toId", ctx.userId))
      .order('desc')
      .paginate(args.paginationOpts);

    return transactions;
  },
});
