import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Quest categories/groups
 */
const questCategoriesC = [
  "onboarding", // Welcome to the club
  "popularity", // Received likes
  "generation", // Photography - AI photos
  "engagement", // Social butterfly - liking posts
  "publication", // Posted pics
  "outfits_creator", // Outfit mastery
  "presets_collector", // Preset collector
  "sharing", // Viral spreader
] as const;

const questCategories = v.union(...questCategoriesC.map((c) => v.literal(c)));

export type QuestCategory = (typeof questCategoriesC)[number];

/**
 * Quest tracking types - what metric is being tracked
 */
const questTypesC = [
  "posts_published", // Number of posts published
  "posts_liked", // Number of posts liked by user
  "posts_shared", // Number of posts shared externally
  "presets_used", // Number of different presets used
  "photos_generated", // Number of AI photos generated
  "outfits_created", // Number of outfits created
  "followers_gained", // Number of followers
  "likes_received", // Number of likes received on user's content
] as const;

export const questTypes = v.union(...questTypesC.map((t) => v.literal(t)));

export type QuestType = (typeof questTypesC)[number];

/**
 * Quests table - defines all available quests
 */
export const quests = defineTable({
  // Quest identification
  title: v.string(),
  description: v.string(),

  // Quest classification
  category: questCategories,
  type: questTypes,

  // Quest requirements
  target: v.number(), // Target amount to complete quest (e.g., 10 for "10 posts")

  // Quest rewards
  rewardCredits: v.number(), // Credits/diamonds awarded

  // Metadata
  updatedAt: v.optional(v.number()),
})
  .index("by_category", ["category"])
  .index("by_type", ["type"])

/**
 * User quest progress table - tracks individual user progress
 */
export const userQuestProgress = defineTable({
  userId: v.id("users"),
  questId: v.id("quests"),

  // Progress tracking
  currentAmount: v.number(), // Current progress (e.g., 5 out of 10)
  isCompleted: v.boolean(),
  completedAt: v.optional(v.number()),

  // Reward tracking
  rewardClaimed: v.boolean(),
  rewardClaimedAt: v.optional(v.number()),

  // Metadata
  startedAt: v.number(), // When user first made progress on this quest
  updatedAt: v.number(), // Last time progress was updated
})
  .index("by_user_and_quest", ["userId", "questId"])