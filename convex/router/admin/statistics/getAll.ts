import { v } from "convex/values";
import { adminQuery } from "../../../procedures";

/**
 * Get statistics for a specific time range duration
 * @param durationMs - The duration in ms (undefined for all time)
 */
export const admin = adminQuery({
  args: {
    durationMs: v.optional(v.number()),
  },
  handler: async ({ db }, args) => {
    const { durationMs } = args;

    // Fetch the 20 most recent statistics snapshots
    const recentStats = await db
      .query("statistics")
      .withIndex("by_snapshot_at")
      .order("desc")
      .take(20);

    // Find the one that matches our requested duration
    const stats = recentStats.find(s => {
      if (durationMs === undefined) {
        return s.startAt === undefined;
      }
      if (s.startAt === undefined) return false;
      return (s.endAt - s.startAt) === durationMs;
    });

    if (!stats) {
      return {
        error: "Statistics not found for this time range. Please run the update stats cron job.",
        requestedRange: { durationMs },
      };
    }

    return stats;
  },
});