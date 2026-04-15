import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * User wallets - tracks credits and other currencies/resources
 */
export const userWallets = defineTable({
  userId: v.id('users'),
  credits: v.number(),
  streak: v.object({
    dailyClaimStreak: v.number(),
    lastClaimAt: v.optional(v.number()),
  }),
  // Future: tokens, gems, premium currency, etc.
})
  .index("by_user_id", ["userId"]);

/**
 * Transaction types for credit movements
 */
export const TRANSACTION_TYPE = v.union(
  v.literal("DAILY_CLAIM"),
  v.literal("QUEST_REWARD"),
  v.literal("GENERATION_COST"),
  v.literal("PRESET_CREATION_COST"),
  v.literal("PRESET_USAGE_REWARD"),
  v.literal("ADMIN_GRANT"),
  v.literal("SYSTEM_GRANT"),
  v.literal("SYSTEM_DEDUCT"),
  v.literal("REFUND"),
  v.literal("SUBSCRIPTION_BONUS"),
  v.literal("TRANSFER"), // For future P2P transfers
);

/**
 * Credit transactions - full audit trail of all credit movements
 */
export const creditTransactions = defineTable({
  fromId: v.union(v.literal('system'), v.id('users')),
  toId: v.union(v.literal('system'), v.id('users')),
  type: TRANSACTION_TYPE,
  amount: v.number(), // Always positive (direction determined by fromId/toId)
  balanceAfter: v.number(), // Balance of the receiving user after transaction
  metadata: v.optional(v.object({
    reason: v.optional(v.string()),
    claim: v.optional(v.object({ streakDay: v.number() })),
    generationId: v.optional(v.id("generations")),
    adminId: v.optional(v.id("users")),
    refund: v.optional(v.object({
      originalTransactionId: v.optional(v.id("creditTransactions")),
    })),
    transfer: v.optional(v.object({
      message: v.optional(v.string()),
    })),
  })),
})
  .index("by_to_id", ["toId"])
  .index("by_from_id", ["fromId"])
  .index("by_type", ["type"]);
