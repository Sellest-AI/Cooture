import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx } from "../../_generated/server";

/**
 * Charges `amount` up front, runs `start`, and refunds the charge if `start` throws.
 *
 * Paid provider calls must only happen inside `start`: the reservation fails with
 * "Insufficient credits" before anything is spent, and concurrent calls cannot all pass a
 * balance check that is read before any of them has paid.
 */
export const withReservedCredits = async (
  ctx: ActionCtx,
  args: { userId: Id<'users'>, amount: number, reason?: string },
  start: () => Promise<Id<'generations'>>,
): Promise<Id<'generations'>> => {
  const transactionId = await ctx.runMutation(internal.router.credits.reserveCredits._internal, args);

  let generationId: Id<'generations'>;
  try {
    generationId = await start();
  } catch (error) {
    await ctx.runMutation(internal.router.credits.refundCredits._internal, {
      userId: args.userId,
      amount: args.amount,
      reason: "Generation could not be started",
      originalTransactionId: transactionId,
    });
    throw error;
  }

  await ctx.runMutation(internal.router.credits.reserveCredits._internal_attach, {
    transactionId,
    generationId,
  });

  return generationId;
};
