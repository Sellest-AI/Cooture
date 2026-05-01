import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalMutation } from "../_generated/server";
import { computeStatsForPeriod } from "../functions/statistics";
import { ActionCtx } from "../procedures";

export const saveStats = internalMutation({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
    statsData: v.any(),
  },
  handler: async (ctx, args) => {
    const { startAt, endAt, statsData } = args;

    // Check if stats for this time range already exist
    const existingStats = await ctx.db
      .query("statistics")
      .withIndex("by_time_range", q =>
        q.eq("startAt", startAt).eq("endAt", endAt)
      )
      .first();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, statsData);
    } else {
      await ctx.db.insert("statistics", statsData);
    }
  },
});


export const updateOne = internalAction({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { startAt, endAt } = args;
    const statsData = await computeStatsForPeriod(ctx, startAt, endAt);

    await ctx.runMutation(internal.crons.updateStatistics.saveStats, {
      startAt,
      endAt,
      statsData,
    });
  },
});

/**
 * Update statistics for common time ranges (called by cron)
 * Stores: last 24h, last 7 days, last 30 days, all time
 */
export const updateAll = internalAction({
  handler: async (ctx: ActionCtx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Log the update
    console.log("Updating statistics...");

    // Spawn workflows instead of running simple actions, allowing fault-tolerant scheduling
    await ctx.runAction(internal.crons.updateStatistics.updateOne, {
      startAt: oneDayAgo,
      endAt: now,
    });

    await ctx.runAction(internal.crons.updateStatistics.updateOne, {
      startAt: sevenDaysAgo,
      endAt: now,
    });

    await ctx.runAction(internal.crons.updateStatistics.updateOne, {
      startAt: thirtyDaysAgo,
      endAt: now,
    });

    await ctx.runAction(internal.crons.updateStatistics.updateOne, {
      startAt: undefined, // all time
      endAt: now,
    });

    return { success: true, message: "All statistics workflows spawned" };
  },
});
