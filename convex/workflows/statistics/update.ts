import { WorkflowManager } from "@convex-dev/workflow";
import { v } from "convex/values";
import { components, internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { computeStatsForPeriod } from "../../functions/statistics/updateStats";
import { ActionCtx, internalMutation } from "../../procedures";

export const workflow = new WorkflowManager(components.workflow);

export const updateStatisticsWorkflow = workflow.define({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Step: Compute stats (Action limits apply mostly, heavily memory/read intense)
    const statsData = await ctx.runAction(internal.workflows.statistics.update.computeStatsStep, {
      startAt: args.startAt,
      endAt: args.endAt,
    });

    // 2. Step: Save stats (Mutation limits apply, quick write)
    await ctx.runMutation(internal.workflows.statistics.update.saveStats, {
      startAt: args.startAt,
      endAt: args.endAt,
      statsData,
    });
  },
});

export const computeStatsStep = internalAction({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
  },
  handler: async (ctx: ActionCtx, args) => {
    const { startAt, endAt } = args;

    // Evaluate the compute without holding mutation locks
    const statsData = await computeStatsForPeriod(ctx, startAt, endAt);

    return statsData;
  },
});

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
