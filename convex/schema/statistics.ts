import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Pre-computed statistics for admin dashboard
 * Uses time ranges (startAt, endAt) for granular queries
 * Updated periodically via cron job
 */
export const statistics = defineTable({
  // Time range this statistic covers (timestamps in ms)
  startAt: v.optional(v.number()), // null/undefined = beginning of time
  endAt: v.number(), // required - end of time range

  // When this snapshot was taken
  snapshotAt: v.number(),

  // --- User Metrics ---
  users: v.object({
    total: v.number(),
    active: v.number(), // users with activity in the period
    newRegistrations: v.number(),
    byRole: v.object({
      admin: v.number(),
      user: v.number(),
      guest: v.number(),
      bot: v.number(),
    }),
    byStatus: v.object({
      active: v.number(),
      inactive: v.number(),
      flagged: v.number(),
      suspended: v.number(),
      waitlist: v.number(),
      deleted: v.number(),
    }),
    withSubscriptions: v.number(),
  }),

  // --- Content Metrics ---
  content: v.object({
    items: v.object({
      total: v.number(),
      new: v.number(), // created in period
    }),
    outfits: v.object({
      total: v.number(),
      new: v.number(),
    }),
    generations: v.object({
      total: v.number(),
      new: v.number(),
      completed: v.number(),
    }),
    videos: v.object({
      total: v.number(),
      new: v.number(),
    }),
  }),

  // --- Engagement Metrics ---
  engagement: v.object({
    likes: v.object({
      total: v.number(),
      new: v.number(),
      byType: v.object({
        generation: v.number(),
        outfit: v.number(),
      }),
    }),
    follows: v.object({
      total: v.number(),
      new: v.number(),
    }),
    bookmarks: v.object({
      total: v.number(),
      new: v.number(),
    }),
  }),

  // --- AI Usage Metrics ---
  aiUsage: v.object({
    generations: v.object({
      total: v.number(),
      completed: v.number(),
      failed: v.number(),
      inReview: v.number(),
    }),
    tokensUsed: v.number(),
    creditsUsed: v.number(),
  }),
})
  .index("by_time_range", ["startAt", "endAt"])
  .index("by_snapshot_at", ["snapshotAt"])
  .index("by_end_at", ["endAt"]);
