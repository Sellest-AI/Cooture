import { CREDITS_CONFIG, calculateDailyReward, getUserWallet } from "../../functions/credits";
import { authMutation } from "../../procedures";

/**
 * Claim daily credits with streak progression
 * Can be claimed once every 20 hours
 * Streak continues if claimed within 48 hours, otherwise resets to day 1
 */
export const authed = authMutation({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    // Get user's wallet
    const wallet = await getUserWallet(ctx, userId);

    const now = Date.now();
    const lastClaim = wallet.streak.lastClaimAt ?? 0;
    const hoursSinceLastClaim = lastClaim === 0 ? Infinity : (now - lastClaim) / (1000 * 60 * 60);

    // Check if user can claim (must wait MIN_HOURS_BETWEEN_CLAIMS)
    if (hoursSinceLastClaim < CREDITS_CONFIG.MIN_HOURS_BETWEEN_CLAIMS)
      throw new Error(`You've already claimed today.`);

    // Determine if streak continues or resets
    const streakContinues = hoursSinceLastClaim < CREDITS_CONFIG.MAX_HOURS_TO_MAINTAIN_STREAK;
    const currentStreakDay = wallet.streak.dailyClaimStreak;

    // Calculate new streak day (keeps incrementing forever)
    let newStreakDay: number;
    if (currentStreakDay === 0 || !streakContinues) {
      // First time claiming or streak broken - start at day 1
      newStreakDay = 1;
    } else {
      // Continue streak - keep incrementing (day 1, 2, 3, ..., 100, 101, etc.)
      newStreakDay = currentStreakDay + 1;
    }

    // Calculate reward for this streak day
    const rewardAmount = calculateDailyReward(newStreakDay);
    const newBalance = wallet.credits + rewardAmount;

    // Create transaction record
    await ctx.db.insert("creditTransactions", {
      fromId: "system",
      toId: userId,
      type: "DAILY_CLAIM",
      amount: rewardAmount,
      balanceAfter: newBalance,
      metadata: {
        claim: {
          streakDay: newStreakDay,
        },
      },
    });

    // Update wallet
    await ctx.db.patch(wallet._id, {
      credits: newBalance,
      streak: {
        dailyClaimStreak: newStreakDay,
        lastClaimAt: now,
      },
    });

    return {
      credits: newBalance,
      rewardAmount,
      streakDay: newStreakDay,
      streakBroken: !streakContinues && currentStreakDay > 0,
    };
  },
});
