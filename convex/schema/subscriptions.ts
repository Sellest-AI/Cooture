import { defineTable } from "convex/server";
import { v } from "convex/values";

export const SUBSCRIPTIONS_NAME = v.union(
  v.literal('free'),
  v.literal('starter'),
  v.literal('creative'),
  v.literal('professional')
)

export const SUBSCRIPTION_STATUS = v.union(
  v.literal("INCOMPLETE"),
  v.literal("INCOMPLETE_EXPIRED"),
  v.literal("TRIALING"),
  v.literal("ACTIVE"),
  v.literal("PAST_DUE"),
  v.literal("CANCELED"),
  v.literal("UNPAID"),
  v.literal("PAUSED"),
  v.literal("ENDED")
)

const subscriptionUsages = v.object({
  creditLimit: v.optional(v.number()), // Maximum number of credits available.
  creditsUsed: v.number(), // Number of credits already used.
  // --- LLM usage ---
  tokensLimit: v.optional(v.number()), // Maximum allowed tokens.
  tokensUsed: v.number(), // Number of tokens already used.
})

export const subscriptions = defineTable({
  userId: v.id('users'),
  isActive: v.boolean(),
  status: SUBSCRIPTION_STATUS,
  internalProductId: SUBSCRIPTIONS_NAME,
  // --- stripe ---
  stripeSubscriptionId: v.optional(v.string()),
  stripeProductId: v.optional(v.string()),
  stripePriceId: v.optional(v.string()),
  // --- renewal ---
  internalRenewAt: v.optional(v.number()),
  externalRenewAt: v.optional(v.number()),
  renewalFunctionId: v.optional(v.id("_scheduled_functions")),
  // --- dates ---
  startAt: v.number(),
  expireAt: v.optional(v.number()),
  // --- usage ---
  usage: subscriptionUsages
}).index("by_user_id_and_active", ["userId", "isActive"])

const subscriptionUsagesBackup = v.union(subscriptionUsages, v.object({
  startedAt: v.number(), // Date of the start of the subscription.
  endedAt: v.number(), // Date of the end of the subscription.
}))

export const subscriptionsHistory = defineTable({
  userId: v.id('users'),
  year: v.number(),
  usages: v.array(subscriptionUsagesBackup),
})