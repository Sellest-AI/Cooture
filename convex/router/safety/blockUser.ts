import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    if (args.userId === ctx.userId) {
      return { success: false, message: "You cannot block yourself." };
    }

    const existingBlock = await ctx.db.query("userBlocks")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", ctx.userId).eq("blockedId", args.userId)
      ).first();

    if (existingBlock) {
      return { success: true, message: "User is already blocked." };
    }

    await ctx.db.insert("userBlocks", {
      blockerId: ctx.userId,
      blockedId: args.userId,
    });

    return { success: true };
  },
});
