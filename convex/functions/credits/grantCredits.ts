import { Doc, Id } from "../../_generated/dataModel";
import { MutationCtx } from "../../_generated/server";
import { TRANSACTION_TYPE } from "../../schema/wallets";

type TransactionType = typeof TRANSACTION_TYPE['type'];

type TransactionMetadata = Doc<'creditTransactions'>['metadata'];

/**
 * Grant credits to a user (add credits)
 * Creates a transaction record and updates the user's wallet
 */
export async function grantCredits(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    amount: number;
    type: TransactionType;
    metadata?: TransactionMetadata;
  }
): Promise<{ newBalance: number; transactionId: Id<"creditTransactions"> }> {
  const { userId, amount, type, metadata } = args;

  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  // Get user's wallet
  const wallet = await ctx.db
    .query("userWallets")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (!wallet) {
    throw new Error("User wallet not found");
  }

  // Calculate new balance
  const newBalance = wallet.credits + amount;

  // Create transaction record
  const transactionId = await ctx.db.insert("creditTransactions", {
    fromId: "system",
    toId: userId,
    type,
    amount,
    balanceAfter: newBalance,
    metadata,
  });

  // Update wallet balance
  await ctx.db.patch(wallet._id, {
    credits: newBalance,
  });

  return { newBalance, transactionId };
}
