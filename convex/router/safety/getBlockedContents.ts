import { notEmpty } from "@shared/utils";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("userReports")
      .withIndex("by_reporter", (q) => q.eq("userId", ctx.userId))
      .collect();

    const blockedUsers = await ctx.db
      .query("userBlocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", ctx.userId))
      .collect();

    return {
      blockedUsers: blockedUsers.map(b => b.blockedId),
      reportedOutfits: reports.map(r => r.outfitId).filter(notEmpty),
      reportedGenerations: reports.map(r => r.generationId).filter(notEmpty),
      reportedItems: reports.map(r => r.itemId).filter(notEmpty),
      reportedPresets: reports.map(r => r.presetId).filter(notEmpty),
    };
  },
});
