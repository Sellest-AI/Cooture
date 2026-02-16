import { Id } from "../../_generated/dataModel";
import { MutationCtx } from "../../_generated/server";
import { CREDITS_CONFIG } from "./credits.config";

/**
 * Initialize a wallet for a new user
 */
export async function createUserWallet(
  ctx: MutationCtx,
  userId: Id<"users">,
  startingCredits: number = CREDITS_CONFIG.STARTING_CREDITS
): Promise<Id<"userWallets">> {
  // Check if wallet already exists
  const existing = await ctx.db
    .query("userWallets")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (existing) {
    return existing._id;
  }

  // Create new wallet
  const walletId = await ctx.db.insert("userWallets", {
    userId,
    credits: startingCredits,
    streak: {
      dailyClaimStreak: 0,
      lastClaimAt: undefined,
    },
  });

  // Create initial transaction if starting credits > 0
  if (startingCredits > 0) {
    await ctx.db.insert("creditTransactions", {
      fromId: "system",
      toId: userId,
      type: "SYSTEM_GRANT",
      amount: startingCredits,
      balanceAfter: startingCredits,
      metadata: {
        reason: "Initial credits for new user",
      },
    });
  }

  return walletId;
}
