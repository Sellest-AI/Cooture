import { calculateDailyReward, CREDITS_CONFIG, getUserWallet } from "../../functions/credits";
import { authQuery } from "../../procedures";

/**
 * Get the authenticated user's wallet information
 * Returns credits balance, streak information, and next claim availability
 */
export const authed = authQuery({
  args: {},
  handler: async (ctx) => {
    const wallet = await getUserWallet(ctx, ctx.userId);

    // Calculate if user can claim now
    const now = Date.now();
    const lastClaim = wallet.streak.lastClaimAt ?? 0;
    const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

    const MIN_HOURS = CREDITS_CONFIG.MIN_HOURS_BETWEEN_CLAIMS;
    const canClaimNow = hoursSinceLastClaim >= MIN_HOURS;
    const nextClaimAt = canClaimNow
      ? now
      : lastClaim + (MIN_HOURS * 60 * 60 * 1000);

    const currentReward = calculateDailyReward(wallet.streak.dailyClaimStreak);

    const streak = {
      ...wallet.streak,
      currentReward
    }

    return {
      _creationTime: wallet._creationTime,
      credits: wallet.credits,
      streak: streak,
      canClaimNow,
      nextClaimAt,
    };
  },
});
