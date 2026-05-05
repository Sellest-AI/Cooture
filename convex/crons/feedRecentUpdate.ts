import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { FEED_CONFIG } from "../functions/feed/feed.config";
import { internalMutation, MutationCtx } from "../procedures";

const extractPostDetails = async (ctx: MutationCtx, feedScore: Doc<'feedScores'>) => {
  const { generationId, outfitId } = feedScore;

  if (!generationId || outfitId)
    return {
      hasVideo: false,
      hasOutfit: true,
      hasPreset: false,
    };

  const [predictions, generation] = await Promise.all([
    await ctx.db.query('predictions')
      .withIndex('by_generation_id', q => q.eq('generationId', generationId))
      .collect(),
    await ctx.db.query('presetGenerations')
      .withIndex('by_generation_id', q => q.eq('generationId', generationId))
      .first()
  ])

  const hasVideo = predictions.some(pred => pred.videoId && pred.status === 'ACCEPTED');
  const hasPreset = !!generation?.presetId;
  const hasOutfit = !!generation?.outfitId;
  const carouselLength = predictions.filter((p) => p.status === 'ACCEPTED').length;

  return {
    carouselLength,
    hasVideo,
    hasOutfit,
    hasPreset,
  }
}

const extraScore = async (ctx: MutationCtx, feedScore: Doc<'feedScores'>) => {
  const KEYS = feedScore.generationId ?
    ['by_generation_id', 'generationId'] as const :
    ['by_outfit_id', 'outfitId'] as const;

  const [_likes, _bookmarks, details] = await Promise.all([
    ctx.db.query('likeStats')
      .withIndex(KEYS[0], q => q.eq(KEYS[1], feedScore.generationId))
      .first(),
    ctx.db.query('bookmarkStats')
      .withIndex(KEYS[0], q => q.eq(KEYS[1], feedScore.generationId))
      .first(),
    await extractPostDetails(ctx, feedScore),
  ]);

  const likes = _likes ? _likes.count * FEED_CONFIG.LIKES_WEIGHT : 0;
  const bookmarks = _bookmarks ? _bookmarks.count * FEED_CONFIG.SAVES_WEIGHT : 0;

  const outfitScore = details.hasOutfit ? FEED_CONFIG.OUTFIT_WEIGHT : 0;
  const presetScore = details.hasPreset ? FEED_CONFIG.PRESET_WEIGHT : 0;
  const videoScore = details.hasVideo ? FEED_CONFIG.VIDEO_WEIGHT : 0;
  // Each additional accepted prediction adds to the score, with a minimum of 0 (no negative impact)
  const carouselScore = Math.max(0, ((details.carouselLength ?? 0) - 1) * FEED_CONFIG.CAROUSEL_WEIGHT);

  return likes + bookmarks + outfitScore + presetScore + videoScore + carouselScore;
}

const updateScore = async (ctx: MutationCtx, feedScore: Doc<'feedScores'>) => {
  const now = Date.now();
  const ageInHours = (now - feedScore._creationTime) / (60 * 60 * 1000);

  // Random score between 0 and 4000 based on id
  const randomScore = parseInt(feedScore._id.toString().slice(-6), 16) % FEED_CONFIG.RANDOM_SCORE_RANGE;
  const extra = await extraScore(ctx, feedScore);
  const mergedScore = FEED_CONFIG.DEFAULT_SCORE + randomScore + extra;

  // Linear percentage decay: 0% at creation → 90% at freeze time
  const ageInHoursClamped = Math.min(ageInHours, FEED_CONFIG.FREEZE_AGE_HOURS);
  const decayPercent = (ageInHoursClamped / FEED_CONFIG.FREEZE_AGE_HOURS) * FEED_CONFIG.FREEZE_DECAY_PERCENT;
  const decay = Math.round(mergedScore * (decayPercent / 100));

  // Update the score and timestamp
  const finalScore = Math.round(Math.max(0, mergedScore - decay));
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
      await ctx.scheduler.runAfter(0, internal.crons.feedRecentUpdate._internal,
        { minAgeHours, maxAgeHours, cursor: result.continueCursor });

    return {
      updatedCount,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  }
})