import { defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(
  v.literal("ADMIN"),
  v.literal("USER"),
  v.literal("GUEST"),
  v.literal("BOT"),
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

const userPlan = v.object({
  id: v.string(), // e.g., "COOTURE_PLUS"
  renewalInterval: v.union(
    v.literal("weekly"),
    v.literal("monthly"),
    v.literal("yearly"),
  )
})

export const usersExtended = defineTable({
  userId: v.id('users'),
  canTakeFreeTrial: v.boolean(),
  stripeCustomerId: v.string(),
  revenueCatUserId: v.optional(v.string()),
  accountStatus: accountStatus,
  role: role,
  plan: v.optional(userPlan),
  // Profile
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  // Image
  imageId: v.optional(v.id('images')),
  imageUrl: v.optional(v.string()),
}).index("by_user_id", ["userId"])
  .index("by_username", ["username"])
  .index("by_stripe_customer_id", ["stripeCustomerId"])
  .index("by_revenuecat_user_id", ["revenueCatUserId"])
  .searchIndex("search_username", { searchField: "username" })
  .searchIndex("search_name", { searchField: "name" });

export const userImages = defineTable({
  userId: v.id('users'),
  imageId: v.id('images'),
})
  .index("by_image_id", ["imageId"])
  .index("by_user_id", ["userId"]);

export const usersAppearance = defineTable({
  userId: v.id('users'),
  frontImageId: v.optional(v.id('images')),
  sideImageId: v.optional(v.id('images')),
  smileImageId: v.optional(v.id('images')),
  heightCm: v.optional(v.number()),
  gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
  size: v.optional(userSizes),
  // topAngleImageId: v.id('images'),
})
  .index("by_user_id", ["userId"])

export const bots = defineTable({
  userId: v.id('users'),
  age: v.number(),
  cronFunctionId: v.optional(v.id("_scheduled_functions")),
})
  .index("by_user_id", ["userId"])
