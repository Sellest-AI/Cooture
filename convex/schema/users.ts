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
  v.literal("WAITLIST"),
);

export const userSizes = v.union(
  v.literal("lean"),
  v.literal("average"),
  v.literal("athletic"),
  v.literal("muscular"),
  v.literal("heavy"),
  v.literal("heavyset"),
);

export const usersExtended = defineTable({
  userId: v.id('users'),
  canTakeFreeTrial: v.boolean(),
  stripeCustomerId: v.string(),
  accountStatus: accountStatus,
  role: role,
  // Profile
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  // Image
  imageId: v.optional(v.id('images')),
  imageUrl: v.optional(v.string()),
}).index("by_user_id", ["userId"])
  .index("by_stripe_customer_id", ["stripeCustomerId"]);

export const userImages = defineTable({
  userId: v.id('users'),
  imageId: v.id('images'),
})
  .index("by_image_id", ["imageId"])
  .index("by_user_id", ["userId"]);

export const usersAppearance = defineTable({
  userId: v.id('users'),
  frontImageId: v.id('images'),
  sideImageId: v.id('images'),
  smileImageId: v.id('images'),
  heightCm: v.optional(v.number()),
  gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
  size: v.optional(userSizes),
  // topAngleImageId: v.id('images'),
})
  .index("by_user_id", ["userId"])
