import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation } from "../../procedures";
import { questTypes } from "../../schema/quests";

export const _internal = internalMutation({
  args: {
    questType: questTypes,
    userId: v.id("users"),
    increment: v.optional(v.number()),
    decrement: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { questType, userId, increment, decrement } = args;

    // Get all quests of the given type
    const quests = await ctx.db.query("quests")
      .withIndex("by_type", q => q.eq("type", questType))
      .collect();

    for (const quest of quests) {
      // Get user's progress for this quest
      const progress = await ctx.db.query("userQuestProgress")
        .withIndex("by_user_and_quest", q => q.eq("userId", userId).eq("questId", quest._id))
        .first();

      const newAmount = (progress?.currentAmount ?? 0) + (increment ?? -(decrement ?? 0));
      const wasCompleted = progress?.isCompleted || false;
      const isNowCompleted = newAmount >= quest.target;

      // Only allow claiming reward if they weren't already completed before, to prevent farming by toggling actions on/off
      const claimReward = progress?.rewardClaimed ? false : (!wasCompleted && isNowCompleted);

      if (!progress) {
        // If no progress exists, create a new entry
        await ctx.db.insert("userQuestProgress", {
          userId,
          questId: quest._id,
          currentAmount: newAmount,
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? Date.now() : undefined,
          rewardClaimed: claimReward,
          startedAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        // Always update progress to track real progress, even if already completed
        // This ensures that if quest targets change in the future, we have accurate data
        // The rewardClaimed flag prevents double-claiming, not isCompleted
        await ctx.db.patch(progress._id, {
          currentAmount: newAmount,
          isCompleted: isNowCompleted,
          // Only set completedAt the first time it's completed
          completedAt: !wasCompleted && isNowCompleted ? Date.now() : progress.completedAt,
          updatedAt: Date.now(),
          rewardClaimed: progress.rewardClaimed || claimReward,
        });
      }

      if (claimReward) {
        await ctx.runMutation(internal.router.credits.grantCredits._internal, {
          userId,
          amount: quest.rewardCredits,
          type: "QUEST_REWARD",
          metadata: {
            reason: `Quest completed: ${quest.title} (${quest.type})`,
          }
        })
      }
    }
  }
})