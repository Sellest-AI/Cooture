import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { FEED_CONFIG } from "../functions/feed/feed.config";
import { internalMutation, MutationCtx } from "../procedures";

const updateScore = async (ctx: MutationCtx, feedScore: Doc<'feedScores'>) => {
  const now = Date.now();
  const ageInHours = (now - feedScore._creationTime) / (60 * 60 * 1000);

  let newScore: number;

  // Random score between 0 and 4000 based on id
  const randomScore = parseInt(feedScore._id.toString().slice(-6), 16) % FEED_CONFIG.RANDOM_SCORE_RANGE;

  // Posts between 7-8 days old (168h-192h): freeze at configured freeze score
  if (ageInHours >= FEED_CONFIG.FREEZE_AGE_HOURS) {
    newScore = -1 * Math.round(FEED_CONFIG.DEFAULT_SCORE / 1.5);
  } else {
    // Normal decay for posts < 5 days old
    const decayAmount = Math.floor(ageInHours * FEED_CONFIG.HOURLY_DECAY);
    newScore = FEED_CONFIG.DEFAULT_SCORE - decayAmount;
  }

  const finalScore = Math.round(Math.max(0, newScore + randomScore));

  // Update the score and timestamp
  await ctx.db.patch(feedScore._id, { score: finalScore, updatedAt: now });
}

export const _internal = internalMutation({
  args: {
    minAgeHours: v.optional(v.number()), // Minimum age in hours (optional)
    maxAgeHours: v.number(), // Maximum age in hours
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { cursor, minAgeHours = 0, maxAgeHours }) => {
    const now = Date.now();
    const cutoffTimeMin = now - (minAgeHours * 60 * 60 * 1000); // Older than this
    const cutoffTimeMax = now - (maxAgeHours * 60 * 60 * 1000); // Younger than this

    // Query posts within the age range that aren't archived
    const result = await ctx.db
      .query("feedScores")
      .withIndex("by_creation_time", q => q.gt("_creationTime", cutoffTimeMax)
        .lt("_creationTime", cutoffTimeMin)).order("desc")
      .filter(q => q.eq(q.field("archived"), false))
      .paginate({ numItems: 500, cursor: cursor ?? null });

    let updatedCount = 0;
    // Apply time-based decay to each post
    for (const feedScore of result.page) {
      await updateScore(ctx, feedScore);
      updatedCount++;
    }

    // If there are more results, schedule another iteration
    if (!result.isDone)
      await ctx.scheduler.runAfter(0, internal.cron.feedRecentUpdate._internal,
        { minAgeHours, maxAgeHours, cursor: result.continueCursor });

    return {
      updatedCount,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  }
})