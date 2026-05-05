import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation } from "../../procedures";
import { statistics } from '../../schema/statistics';
import { workflow } from "../config";

export const updateStatisticsWorkflow = workflow.define({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
  },
  handler: async (step, args): Promise<void> => {
    const { startAt, endAt } = args;
    const now = endAt;

    // 1. Step: Compute user stats via workflow
    const userMetrics = await step.runWorkflow(internal.workflows.database.countUserMetrics.run, {
      startTime: startAt,
    });

    const userStats = {
      total: userMetrics.totalUsers,
      active: 0,
      newRegistrations: userMetrics.newRegistrations,
      byRole: userMetrics.roleCounts,
      byStatus: userMetrics.statusCounts,
      withSubscriptions: userMetrics.withSubscriptions,
    };

    // 2. Step: Compute content stats via subworkflows (run concurrently)
    const [
      itemsTotal, itemsNew,
      outfitsTotal, outfitsNew,
      generationsTotal, generationsNew,
      videosTotal, videosNew,
      generationsCompleted
    ] = await Promise.all([
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "items" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "items", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "outfits" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "outfits", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "generations" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "generations", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "videos" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "videos", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countByField.run, { table: "generations", field: "status", startTime: startAt }),
    ]);

    const contentStats = {
      items: { total: itemsTotal, new: itemsNew },
      outfits: { total: outfitsTotal, new: outfitsNew },
      generations: {
        total: generationsTotal,
        new: generationsNew,
        completed: generationsCompleted.counts?.['COMPLETED'] || 0,
      },
      videos: { total: videosTotal, new: videosNew },
    };

    // 3. Step: Compute engagement stats via subworkflows
    const [
      likesTotal, likesNew,
      followsTotal, followsNew,
      bookmarksTotal, bookmarksNew,
      likesByType
    ] = await Promise.all([
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "likes" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "likes", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "follows" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "follows", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "bookmarks" }),
      startAt ? step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "bookmarks", startTime: startAt }) : 0,
      step.runWorkflow(internal.workflows.database.countByField.run, { table: "likes", field: "type", startTime: startAt }),
    ]);

    const engagementStats = {
      likes: {
        total: likesTotal,
        new: likesNew,
        byType: {
          generation: likesByType.counts?.["generation"] || 0,
          outfit: likesByType.counts?.["outfit"] || 0,
        },
      },
      follows: { total: followsTotal, new: followsNew },
      bookmarks: { total: bookmarksTotal, new: bookmarksNew },
    };

    // 4. Step: Compute AI usage stats

    const [predictionsTotal, predictionsByStatus] = await Promise.all([
      step.runWorkflow(internal.workflows.database.countDocuments.run, { table: "predictions" }),
      step.runWorkflow(internal.workflows.database.countByField.run, { table: "predictions", field: "status", startTime: startAt }),
    ]);

    const aiUsageStats = {
      generations: {
        total: predictionsTotal,
        loading: predictionsByStatus.counts?.["LOADING"] || 0,
        completed: (predictionsByStatus.counts?.["ACCEPTED"] || 0) + (predictionsByStatus.counts?.["REJECTED"] || 0),
        accepted: predictionsByStatus.counts?.["ACCEPTED"] || 0,
        rejected: predictionsByStatus.counts?.["REJECTED"] || 0,
        failed: predictionsByStatus.counts?.["FAILED"] || 0,
        inReview: predictionsByStatus.counts?.["REVIEW"] || 0,
      },
    };

    const statsData = {
      startAt,
      endAt,
      snapshotAt: now,
      users: userStats,
      content: contentStats,
      engagement: engagementStats,
      aiUsage: aiUsageStats,
    };

    // 5. Step: Save stats
    await step.runMutation(internal.workflows.statistics.update.saveStats, {
      startAt,
      endAt,
      statsData,
    });
  },
});

const statsDataValidator = statistics.validator;

export const saveStats = internalMutation({
  args: {
    startAt: v.optional(v.number()),
    endAt: v.number(),
    statsData: statsDataValidator,
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
