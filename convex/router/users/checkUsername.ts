import { v } from "convex/values";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const sanitizedUsername = args.username
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')            // spaces → underscore
      .replace(/[^a-z0-9_.-]/g, '')   // strip disallowed chars
      .replace(/^[^a-z0-9]+/, '')     // remove leading punctuation
      .slice(0, 24);

    const existingUser = await ctx.db.query("usersExtended")
      .withIndex("by_username", q => q.eq("username", sanitizedUsername))
      .first();

    const available = existingUser ? false : true;

    return {
      available,
      sanitizedUsername,
    };
  }
})