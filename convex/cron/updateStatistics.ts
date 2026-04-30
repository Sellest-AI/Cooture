import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { ActionCtx } from "../procedures";

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
    await ctx.runAction(internal.workflows.statistics.update.updateStatisticsWorkflow, {
      startAt: oneDayAgo,
      endAt: now,
    });

    await ctx.runAction(internal.workflows.statistics.update.updateStatisticsWorkflow, {
      startAt: sevenDaysAgo,
      endAt: now,
    });

    await ctx.runAction(internal.workflows.statistics.update.updateStatisticsWorkflow, {
      startAt: thirtyDaysAgo,
      endAt: now,
    });

    await ctx.runAction(internal.workflows.statistics.update.updateStatisticsWorkflow, {
      startAt: undefined, // all time
      endAt: now,
    });

    return { success: true, message: "All statistics workflows spawned" };
  },
});
