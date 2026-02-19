import { defineTable } from "convex/server";
import { v } from "convex/values";

export const waitlist = defineTable({
  numberOfUsers: v.number(),
  numberOfCodes: v.number(),
  numberOfUsedCodes: v.number(),
});

export const waitlistCodes = defineTable({
  userId: v.id('users'),
  usedById: v.optional(v.id('users')),
  usedAt: v.optional(v.number()),
  code: v.string(),
})
  .index("by_user_id", ["userId"])
  .index("by_code", ["code"])