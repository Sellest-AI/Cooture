import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const existingBlock = await ctx.db.query("userBlocks")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", ctx.userId).eq("blockedId", args.userId)
      ).first();

    if (existingBlock) {
      await ctx.db.delete(existingBlock._id);
    }

    return { success: true };
  },
});
