import { v } from "convex/values";
import { grantCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";

export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, amount } = args;
    // Grant credits to the user
    await grantCredits(ctx, {
      userId,
      amount,
      type: "ADMIN_GRANT",
    });
  }
})