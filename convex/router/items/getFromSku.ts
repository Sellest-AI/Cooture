import { v } from "convex/values";
import { sanitizeItem } from "../../functions/items/sanitizeItem";
import { internalQuery, publicQuery } from "../../procedures";

export const _internal = internalQuery({
  args: {
    sku: v.string(),
  },
  handler: async (ctx, { sku }) => {
    const item = await ctx.db.query("items").withIndex('by_sku', (q) => q.eq('sku', sku)).first();
    if (!item) return null;
    return sanitizeItem(item);
  }
})

export const anon = publicQuery({
  args: {
    sku: v.string(),
  },
  handler: async (ctx, { sku }) => {
    const item = await ctx.db.query("items").withIndex('by_sku', (q) => q.eq('sku', sku)).first();
    if (!item) return null;
    return sanitizeItem(item);
  }
})