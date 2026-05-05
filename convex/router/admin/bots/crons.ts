import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { internalMutation } from "../../../procedures";

const CONFIG = {
  cronFrequency: [12, 20], // in hours, the cron will run every 8 to 12 hours randomly to avoid all bots running at the same time
  like: {
    amount: 5, // Number of items to like per cron
    minDelay: 1, // in minutes
    maxDelay: 3, // in minutes
    stackDelay: 30, // in seconds
    followChance: 0.1, // 0.1% chance to follow the person
  },
  bookmark: {
    amount: 3, // Number of items to bookmark per cron
    minDelay: 3, // in minutes
    maxDelay: 7, // in minutes
    stackDelay: 30, // in seconds
  }
}

export const _internal = internalMutation({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const bot = await ctx.db.query("bots")
      .withIndex("by_user_id", q => q.eq("userId", args.id)).first();

    if (!bot) return false;

    await ctx.runMutation(internal.router.admin.bots.crons._internal_step_likes, { id: args.id });
    await ctx.runMutation(internal.router.admin.bots.crons._internal_step_bookmark, { id: args.id });

    // Trigger the cron again in 8-12 hours
    const randomDelay = Math.floor(Math.random() * ((CONFIG.cronFrequency[1] * 60 * 60 * 1000) - (CONFIG.cronFrequency[0] * 60 * 60 * 1000) + 1) + (CONFIG.cronFrequency[0] * 60 * 60 * 1000));
    const scheduledFunctionId = await ctx.scheduler.runAfter(randomDelay, internal.router.admin.bots.crons._internal, {
      id: args.id,
    })

    // Save the scheduled function id to the bot, so we can track it and cancel it if needed
    await ctx.db.patch(bot._id, { cronFunctionId: scheduledFunctionId });
  }
})

export const _internal_step_bookmark = internalMutation({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const getPaginated = await ctx.runQuery(api.router.feed.getPaginated.anon, {
      paginationOpts: { numItems: 100, cursor: null },
      maxAge: Date.now()
    });

    const randoms = getPaginated.page.sort(() => 0.5 - Math.random()).slice(0, 10);

    let index = 0;
    for (const item of randoms) {
      // Delay between 1 minutes and 3 minutes
      const randomDelay = Math.floor(Math.random() * ((CONFIG.bookmark.maxDelay * 60 * 1000) - (CONFIG.bookmark.minDelay * 60 * 1000) + 1) + (CONFIG.bookmark.minDelay * 60 * 1000));
      const stackedDelay = index * 1000 * CONFIG.bookmark.stackDelay; // Stack delay of 30 seconds between each bookmark to avoid bookmarking all at once
      const finalDelay = Math.round(randomDelay + stackedDelay);

      await ctx.scheduler.runAfter(finalDelay, internal.router.collection.toggleBookmark._internal, {
        value: true,
        generationId: item.type === 'generation' ? item._id : undefined,
        outfitId: item.type === 'outfit' ? item._id : undefined,
        userId: args.id,
      })

      index++;
    }
  }
});

export const _internal_step_likes = internalMutation({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const getPaginated = await ctx.runQuery(api.router.feed.getPaginated.anon, {
      paginationOpts: { numItems: 100, cursor: null },
      maxAge: Date.now()
    });

    const randoms = getPaginated.page.sort(() => 0.5 - Math.random()).slice(0, CONFIG.like.amount);

    let index = 0;
    for (const item of randoms) {
      // Delay between 1 minutes and 3 minutes
      const randomDelay = Math.floor(Math.random() * ((CONFIG.like.maxDelay * 60 * 1000) - (CONFIG.like.minDelay * 60 * 1000) + 1) + (CONFIG.like.minDelay * 60 * 1000));
      const stackedDelay = index * 1000 * CONFIG.like.stackDelay; // Stack delay of 30 seconds between each like to avoid liking all at once
      const finalDelay = Math.round(randomDelay + stackedDelay);

      await ctx.scheduler.runAfter(finalDelay, internal.router.likes.toggleLike._internal, {
        value: true,
        generationId: item.type === 'generation' ? item._id : undefined,
        outfitId: item.type === 'outfit' ? item._id : undefined,
        userId: args.id,
      })

      // 0.05% chance to follow the person
      if (Math.random() < (CONFIG.like.followChance) / 100) {
        if (item.userId === args.id) continue; // Cannot follow yourself
        await ctx.scheduler.runAfter(finalDelay, internal.router.users.follows.toggleFollow._internal, {
          value: true,
          targetUserId: item.userId,
          userId: args.id,
        });
      }

      index++;
    }
  }
});