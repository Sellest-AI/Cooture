import { v } from "convex/values";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    questId: v.id("quests"),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;

    const quest = await ctx.db.get(args.questId);
    const progress = await ctx.db.query("userQuestProgress")
      .withIndex("by_user_and_quest", q => q.eq("userId", userId).eq("questId", args.questId))
      .first();

    if (!quest) return null;

    return {
      ...quest,
      progress,
    }
  }
})