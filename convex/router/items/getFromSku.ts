import { v } from "convex/values";
import { internalQuery } from "../../procedures";

export const _internal = internalQuery({
  args: {
    sku: v.string(),
  },
  handler: async (ctx, { sku }) => {
    const item = await ctx.db.query("items").withIndex('by_sku', (q) => q.eq('sku', sku)).first();
    return item;
  }
})