import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { grantCredits } from "../../../functions/credits";
import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  args: {
    adminId: v.id('users'),
    userId: v.id('users'),
    credits: v.number(),
    duration: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly"),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, adminId, credits, duration } = args;

    const userExtended = await ctx.db.query('usersExtended')
      .withIndex('by_user_id', q => q.eq('userId', userId)).first();

    if (!userExtended) return false;

    const renewalDate = new Date();
    switch (duration) {
      case "weekly":
        renewalDate.setDate(renewalDate.getDate() + 7);
        break;
      case "monthly":
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        break;
      case "yearly":
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        break;
    }

    if (userExtended.plan?.cancelFunctionId)
      await ctx.scheduler.cancel(userExtended.plan.cancelFunctionId);

    // Schedule a job to remove the premium plan after the duration expires
    const functionId = await ctx.scheduler.runAt(renewalDate,
      internal.router.admin.users.addFakePremium._internal_remove, { userId });

    await ctx.db.patch(userExtended._id, {
      plan: {
        id: "Cooture Plus",
        renewalInterval: duration,
        cancelFunctionId: functionId,
      }
    })

    await grantCredits(ctx, {
      userId,
      type: 'ADMIN_GRANT',
      amount: credits,
      metadata: {
        adminId,
        reason: `temporary premium access (${duration})`,
      }
    })
  }
})

export const _internal_remove = internalMutation({
  args: {
    userId: v.id('users'),
  },
  handler: async ({ db }, { userId }) => {
    const userExtended = await db.query('usersExtended')
      .withIndex('by_user_id', q => q.eq('userId', userId)).first();

    if (!userExtended) return false;

    // Only wipe the plan if there is a plan to wipe, and we aren't accidentally wiping a real paid plan.
    // RevenueCat plans generally don't have a cancelFunctionId (it clears it out on purchase), 
    // so this is a safe way to check if it's the fake premium plan.
    if (userExtended.plan?.cancelFunctionId) {
      await db.patch(userExtended._id, { plan: undefined });
    }
  }
});