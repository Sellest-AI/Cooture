import { v } from "convex/values";
import { publicQuery } from "../../../procedures";

export const anon = publicQuery({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("presets")
      .withSearchIndex("search_name", (q) => q.search("name", args.name.trim()))
      .filter(q => q.eq(q.field('userId'), undefined))
      .collect();

    return results;
  }
})