import { v } from "convex/values";
import { updateWaitlist } from "../../functions/waitlist";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    code: v.string()
  },
  handler: async (ctx, { code }) => {
    const { user } = ctx;

    const codeUpper = code.toUpperCase();

    if (user.accountStatus !== 'WAITLIST') return true;

    const codeData = await ctx.db.query('waitlistCodes')
      .withIndex("by_code", q => q.eq("code", codeUpper)).collect();

    const codes = codeData.filter((c) => !c.usedById && c.userId !== user._id);

    if (codes.length === 0) return false;

    const selectedCode = codes[0];

    // Mark the code as used and update the user's account status to ACTIVE
    await ctx.db.patch(selectedCode._id, { usedById: user._id, usedAt: Date.now() });
    await ctx.db.patch(user._idExtended, { accountStatus: 'ACTIVE' });

    await updateWaitlist(ctx, { addCodeUsed: true, addUsersOut: 1 });

    return true;
  }
})