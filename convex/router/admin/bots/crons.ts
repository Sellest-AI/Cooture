import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const bot = await ctx.db.query("bots")
      .withIndex("by_user_id", q => q.eq("userId", args.id)).first();

    if (!bot) return false;

    const scheduledFunctionId = await ctx.runMutation(internal.router.admin.bots.crons._internal_step_likes, { id: args.id });

    // Save the scheduled function id to the bot, so we can track it and cancel it if needed
    await ctx.db.patch(bot._id, { cronFunctionId: scheduledFunctionId });
  }
})

export const _internal_step_likes = internalMutation({
  args: { id: v.id('users') },
  handler: async (ctx, args): Promise<Id<'_scheduled_functions'>> => {
    const getPaginated = await ctx.runQuery(api.router.feed.getPaginated.anon, {
      paginationOpts: { numItems: 100, cursor: null },
      maxAge: Date.now()
    });

    const randoms = getPaginated.page.sort(() => 0.5 - Math.random()).slice(0, 20);


    let index = 0;
    for (const item of randoms) {
      // Delay between 1 minutes and 5 minutes
      const randomDelay = Math.floor(Math.random() * (5 - 1 + 1) + 1) * 60 * 1000;
      const stackedDelay = index * 1000 * 30; // Stack delays by 30 minute per like
      const finalDelay = Math.round(randomDelay + stackedDelay);

      await ctx.scheduler.runAfter(finalDelay, internal.router.likes.toggleLike._internal, {
        value: true,
        generationId: item.type === 'generation' ? item._id : undefined,
        outfitId: item.type === 'outfit' ? item._id : undefined,
        userId: args.id,
      })

      index++;
    }

    // Trigger the cron again in 5-10 hours
    const randomDelay = Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 60 * 1000;
    const scheduledFunctionId = await ctx.scheduler.runAfter(randomDelay, internal.router.admin.bots.crons._internal, {
      id: args.id,
    })

    return scheduledFunctionId;
  }
});