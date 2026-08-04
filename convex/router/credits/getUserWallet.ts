import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { calculateDailyReward, CREDITS_CONFIG, getAllDailyRewards, getUserWallet } from "../../functions/credits";
import { adminQuery, authQuery, QueryCtx } from "../../procedures";

const handler = async (ctx: QueryCtx, userId: Id<"users">) => {
  const wallet = await getUserWallet(ctx, userId);

  // Calculate if user can claim now
  const now = Date.now();
  const lastClaim = wallet.streak.lastClaimAt ?? 0;
  const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

  const MIN_HOURS = CREDITS_CONFIG.MIN_HOURS_BETWEEN_CLAIMS;
  const canClaimNow = hoursSinceLastClaim >= MIN_HOURS;
  const nextClaimAt = canClaimNow ? now : lastClaim + (MIN_HOURS * 60 * 60 * 1000);

  const streakContinues = hoursSinceLastClaim < CREDITS_CONFIG.MAX_HOURS_TO_MAINTAIN_STREAK;
  const currentStreakDay = streakContinues ? wallet.streak.dailyClaimStreak : 0;

  const nextReward = calculateDailyReward(currentStreakDay + 1);
  const weeklyRewards = getAllDailyRewards();

  const streak = {
    ...wallet.streak,
    nextReward,
    weeklyRewards,
    dailyClaimStreak: currentStreakDay
  }

  return {
    _creationTime: wallet._creationTime,
    credits: wallet.credits,
    streak: streak,
    canClaimNow,
    nextClaimAt,
  };
}

/**
 * Get the authenticated user's wallet information
 * Returns credits balance, streak information, and next claim availability
 */
export const authed = authQuery({
  handler: async (ctx) => handler(ctx, ctx.userId)
});

/**
 * Reads any user's balance and streak history from a caller-supplied id, so it must be
 * gated on the ADMIN role — `authQuery` here made it readable by any signed-in user.
 */
export const admin = adminQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => handler(ctx, args.userId)
});
