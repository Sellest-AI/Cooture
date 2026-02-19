import { authQuery } from "../../procedures";

export const authed = authQuery({
  handler: async (ctx) => {
    const { userId } = ctx;

    const codes = await ctx.db.query('waitlistCodes')
      .withIndex("by_user_id", q => q.eq("userId", userId)).collect();

    return codes;
  }
})