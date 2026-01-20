import { defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(
  v.literal("ADMIN"),
  v.literal("USER"),
  v.literal("GUEST"),
);

const accountStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("INACTIVE"),
  v.literal("FLAGGED"),
  v.literal("SUSPENDED"),
);

export const usersExtended = defineTable({
  userId: v.id('users'),
  canTakeFreeTrial: v.boolean(),
  stripeCustomerId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  accountStatus: accountStatus,
  role: role,
}).index("by_user_id", ["userId"])
  .index("by_stripe_customer_id", ["stripeCustomerId"]);

export const userImages = defineTable({
  userId: v.id('users'),
  imageId: v.id('images'),
}).index("by_user_id", ["userId"]);