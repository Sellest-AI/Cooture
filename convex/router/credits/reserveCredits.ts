import { v } from "convex/values";
import { deductCredits } from "../../functions/credits";
import { internalMutation } from "../../procedures";

/**
 * Takes the credits for a generation *before* any paid provider call is made.
 *
 * Checking `canPay` and deducting afterwards let concurrent requests all pass the check,
 * and the deduction failures were swallowed — so every request but the first was free.
 * The deduction is a mutation, so Convex serialises concurrent reservations on the wallet
 * and the second one throws "Insufficient credits" before anything is started.
 */
export const _internal = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { transactionId } = await deductCredits(ctx, {
      userId: args.userId,
      amount: args.amount,
      type: "GENERATION_COST",
      metadata: { reason: args.reason },
    });

    return transactionId;
  },
});

/**
 * Links a reservation to the generation it paid for, once that generation exists.
 * `generations/autoRefund` finds the original charge through `metadata.generationId`.
 */
export const _internal_attach = internalMutation({
  args: {
    transactionId: v.id("creditTransactions"),
    generationId: v.id("generations"),
  },
  handler: async (ctx, { transactionId, generationId }) => {
    const transaction = await ctx.db.get(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    await ctx.db.patch(transactionId, {
      metadata: { ...transaction.metadata, generationId },
    });
  },
});
