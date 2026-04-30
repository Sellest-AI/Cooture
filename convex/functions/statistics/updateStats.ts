import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { TableNames } from "../../_generated/dataModel";
import { ActionCtx, internalQuery } from "../../procedures";

// Valid table names that can be queried
type ValidTableName = TableNames;

/**
 * Process a batch of documents for simple counting
 */
export const processCountBatch = internalQuery({
  args: {
    table: v.string(),
    timeField: v.string(),
    startTime: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    accumulator: v.number(),
  },
  handler: async (ctx, args) => {
    const { table, timeField, startTime, cursor, accumulator } = args;
    const result = await ctx.db
      .query(table as ValidTableName)
      .paginate({ cursor, numItems: 512 });

    const { page, continueCursor, isDone } = result;

    let count = accumulator;

    if (startTime) {
      count += page.filter((doc: any) => {
        const time = doc[timeField] || doc._creationTime;
        return time >= startTime;
      }).length;
    } else {
      count += page.length;
    }

    return { count, continueCursor, isDone };
  },
});

/**
 * Count documents using recursive internalQuery calls
 */
async function countDocuments(
  ctx: ActionCtx,
  table: ValidTableName,
  timeField: string,
  startTime?: number
): Promise<number> {
  let accumulator = 0;
  let cursor: string | null = null;
  let isDone = false;

  while (!isDone) {
    const result: any = await ctx.runQuery(internal.functions.statistics.updateStats.processCountBatch, {
      table,
      timeField,
      startTime,
      cursor,
      accumulator,
    });

    accumulator = result.count;
    cursor = result.continueCursor;
    isDone = result.isDone;
  }

  return accumulator;
}

/**
 * Process a batch for countByField
 */
export const processCountByFieldBatch = internalQuery({
  args: {
    table: v.string(),
    field: v.string(),
    startTime: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    accumulator: v.any(),
  },
  handler: async (ctx, args) => {
    const { table, field, startTime, cursor, accumulator } = args;
    const counts = accumulator as Record<string, number>;

    const result = await ctx.db
      .query(table as ValidTableName)
      .paginate({ cursor, numItems: 512 });

    const { page, continueCursor, isDone } = result;
    const docs = page as any[];

    for (const doc of docs) {
      if (startTime && doc._creationTime < startTime) continue;

      const value = doc[field];
      if (value !== undefined) {
        counts[value] = (counts[value] || 0) + 1;
      }
    }

    return { counts, continueCursor, isDone };
  },
});

/**
 * Count documents by field using recursive internalQuery calls
 */
async function countByField(
  ctx: ActionCtx,
  table: ValidTableName,
  field: string,
  startTime?: number
): Promise<Record<string, number>> {
  let counts: Record<string, number> = {};
  let cursor: string | null = null;
  let isDone = false;

  while (!isDone) {
    const result: any = await ctx.runQuery(internal.functions.statistics.updateStats.processCountByFieldBatch, {
      table,
      field,
      startTime,
      cursor,
      accumulator: counts,
    });

    counts = result.counts;
    cursor = result.continueCursor;
    isDone = result.isDone;
  }

  return counts;
}

/**
 * Process a batch for user metrics
 */
export const processUserMetricsBatch = internalQuery({
  args: {
    startTime: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    accumulator: v.object({
      totalUsers: v.number(),
      newRegistrations: v.number(),
      roleCounts: v.object({
        admin: v.number(),
        user: v.number(),
        guest: v.number(),
        bot: v.number(),
      }),
      statusCounts: v.object({
        active: v.number(),
        inactive: v.number(),
        flagged: v.number(),
        suspended: v.number(),
        waitlist: v.number(),
        deleted: v.number(),
      }),
      withSubscriptions: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { startTime, cursor, accumulator } = args;
    let { totalUsers, newRegistrations, roleCounts, statusCounts, withSubscriptions } = accumulator;

    const result = await ctx.db
      .query("usersExtended")
      .paginate({ cursor, numItems: 512 });

    const { page, continueCursor, isDone } = result;

    for (const user of page) {
      totalUsers++;

      if (startTime && user._creationTime >= startTime) {
        newRegistrations++;
      }

      // Count by role
      if (user.role && roleCounts[user.role.toLowerCase() as keyof typeof roleCounts] !== undefined) {
        roleCounts[user.role.toLowerCase() as keyof typeof roleCounts]++;
      }

      // Count by status
      if (user.accountStatus) {
        const status = user.accountStatus.toLowerCase() as keyof typeof statusCounts;
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++;
        }
      }

      // With subscriptions
      if (user.stripeCustomerId) {
        withSubscriptions++;
      }
    }

    if (!startTime) {
      newRegistrations = totalUsers;
    }

    return {
      totalUsers, newRegistrations, roleCounts, statusCounts, withSubscriptions,
      continueCursor, isDone
    };
  },
});

/**
 * Compute statistics for a given time range
 * @param ctx - Convex context
 * @param startAt - Start of time range (null/undefined = beginning of time)
 * @param endAt - End of time range (required)
 */
export const computeStatsForPeriod = async (
  ctx: ActionCtx,
  startAt?: number,
  endAt: number = Date.now()
) => {
  const now = Date.now();

  // --- User Metrics ---
  let userAccumulator = {
    totalUsers: 0,
    newRegistrations: 0,
    roleCounts: { admin: 0, user: 0, guest: 0, bot: 0 },
    statusCounts: { active: 0, inactive: 0, flagged: 0, suspended: 0, waitlist: 0, deleted: 0 },
    withSubscriptions: 0,
  };

  let cursor: string | null = null;
  let isDone = false;

  while (!isDone) {
    const result: any = await ctx.runQuery(internal.functions.statistics.updateStats.processUserMetricsBatch, {
      startTime: startAt,
      cursor,
      accumulator: userAccumulator,
    });

    userAccumulator = {
      totalUsers: result.totalUsers,
      newRegistrations: result.newRegistrations,
      roleCounts: result.roleCounts,
      statusCounts: result.statusCounts,
      withSubscriptions: result.withSubscriptions,
    };
    cursor = result.continueCursor;
    isDone = result.isDone;
  }

  const { totalUsers, newRegistrations, roleCounts, statusCounts, withSubscriptions } = userAccumulator;

  const userStats = {
    total: totalUsers,
    active: 0,
    newRegistrations,
    byRole: {
      admin: roleCounts.admin,
      user: roleCounts.user,
      guest: roleCounts.guest,
      bot: roleCounts.bot,
    },
    byStatus: {
      active: statusCounts.active,
      inactive: statusCounts.inactive,
      flagged: statusCounts.flagged,
      suspended: statusCounts.suspended,
      waitlist: statusCounts.waitlist,
      deleted: statusCounts.deleted,
    },
    withSubscriptions,
  };

  // --- Content Metrics ---
  const [itemsTotal, itemsNew, outfitsTotal, outfitsNew, generationsTotal, generationsNew, videosTotal, videosNew] = await Promise.all([
    countDocuments(ctx, "items", "_creationTime"),
    startAt ? countDocuments(ctx, "items", "_creationTime", startAt) : 0,
    countDocuments(ctx, "outfits", "_creationTime"),
    startAt ? countDocuments(ctx, "outfits", "_creationTime", startAt) : 0,
    countDocuments(ctx, "generations", "_creationTime"),
    startAt ? countDocuments(ctx, "generations", "_creationTime", startAt) : 0,
    countDocuments(ctx, "videos", "_creationTime"),
    startAt ? countDocuments(ctx, "videos", "_creationTime", startAt) : 0,
  ]);

  // Get generation stats
  const generationsCompleted = await countDocuments(ctx, "generations", "status", startAt);

  const contentStats = {
    items: {
      total: itemsTotal,
      new: itemsNew,
    },
    outfits: {
      total: outfitsTotal,
      new: outfitsNew,
    },
    generations: {
      total: generationsTotal,
      new: generationsNew,
      completed: generationsCompleted,
    },
    videos: {
      total: videosTotal,
      new: videosNew,
    },
  };

  // --- Engagement Metrics ---
  const [likesTotal, likesNew, followsTotal, followsNew, bookmarksTotal, bookmarksNew, likesByType] = await Promise.all([
    countDocuments(ctx, "likes", "_creationTime"),
    startAt ? countDocuments(ctx, "likes", "_creationTime", startAt) : 0,
    countDocuments(ctx, "follows", "_creationTime"),
    startAt ? countDocuments(ctx, "follows", "_creationTime", startAt) : 0,
    countDocuments(ctx, "bookmarks", "_creationTime"),
    startAt ? countDocuments(ctx, "bookmarks", "_creationTime", startAt) : 0,
    countByField(ctx, "likes", "type", startAt),
  ]);

  const engagementStats = {
    likes: {
      total: likesTotal,
      new: likesNew,
      byType: {
        generation: likesByType["generation"] || 0,
        outfit: likesByType["outfit"] || 0,
      },
    },
    follows: {
      total: followsTotal,
      new: followsNew,
    },
    bookmarks: {
      total: bookmarksTotal,
      new: bookmarksNew,
    },
  };

  // --- AI Usage Metrics (simplified for now) ---
  const predictionsTotal = await countDocuments(ctx, "predictions", "_creationTime");

  const aiUsageStats = {
    generations: {
      total: predictionsTotal,
      completed: 0,
      failed: 0,
      inReview: 0,
    },
    tokensUsed: 0,
    creditsUsed: 0,
  };

  return {
    startAt,
    endAt,
    snapshotAt: now,
    users: userStats,
    content: contentStats,
    engagement: engagementStats,
    aiUsage: aiUsageStats,
  };
};
