import { v } from "convex/values";
import { adminQuery } from "../../../procedures";

/**
 * Get statistics for a specific time range
 * @param startAt - Start of time range (null/undefined = beginning of time)
 * @param endAt - End of time range (required)
 */
export const admin = adminQuery({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
  },
  handler: async ({ db }, args) => {
    const { startAt, endAt } = args;

    const stats = await db
      .query("statistics")
      .withIndex("by_time_range", q =>
        q.eq("startAt", startAt).eq("endAt", endAt)
      )
      .first();

    if (!stats) {
      return {
        error: "Statistics not found for this time range. Please run the update stats cron job.",
        requestedRange: { startAt, endAt },
      };
    }

    return stats;
  },
});