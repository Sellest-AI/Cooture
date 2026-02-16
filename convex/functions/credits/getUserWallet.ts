import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

/**
 * Get user's wallet, creating one if it doesn't exist
 */
export async function getUserWallet(
  ctx: QueryCtx,
  userId: Id<"users">
) {
  const wallet = await ctx.db
    .query("userWallets")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (!wallet)
    throw new Error("User wallet not found");

  return wallet!;
}
