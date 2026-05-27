import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { saveNotification } from "../functions/notifications";

export const _internal = internalMutation({
  args: {
    maxAgeDays: v.number(),
  },
  handler: async (ctx, args) => {
    const maxAgeMs = args.maxAgeDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - maxAgeMs;

    const predictions = await ctx.db.query('predictions')
      .withIndex('status', (q) => q.eq('status', 'REVIEW').gte('_creationTime', cutoffTime))
      .collect();

    for (const prediction of predictions) {
      // If the generation is newer than 2 hours, skip it to give more time for the reviewers
      if (Date.now() - prediction._creationTime < 2 * 60 * 60 * 1000) continue;
      if (!prediction.generationId) continue;

      await ctx.scheduler.runAfter(0, internal.crons.notifyInReviews._internal_step, {
        generationId: prediction.generationId,
      })
    }
  }
})

export const _internal_step = internalMutation({
  args: {
    generationId: v.id("generations"),
  },
  handler: async (ctx, args) => {
    const { generationId } = args;

    const generation = await ctx.db.get(generationId);
    if (!generation) return;

    await saveNotification(ctx, {
      userId: generation.userId, actorId: generation.userId,
      type: "generation_ready", generationId,
      pushToDevice: true
    });
  }
})