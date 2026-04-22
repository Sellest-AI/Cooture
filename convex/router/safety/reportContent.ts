import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
    itemId: v.optional(v.id("items")),
    presetId: v.optional(v.id("presets")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user has already reported this content
    const existingReport = await ctx.db.query("userReports")
      .withIndex("by_reporter", (q) => q.eq("userId", ctx.userId))
      .collect();

    const isDuplicateReport = existingReport.some((report) => {
      return (
        (args.generationId && report.generationId === args.generationId) ||
        (args.outfitId && report.outfitId === args.outfitId) ||
        (args.itemId && report.itemId === args.itemId) ||
        (args.presetId && report.presetId === args.presetId)
      );
    });

    if (isDuplicateReport) {
      return { success: false, message: "You have already reported this content." };
    }

    await ctx.db.insert("userReports", {
      userId: ctx.userId,
      generationId: args.generationId,
      presetId: args.presetId,
      outfitId: args.outfitId,
      itemId: args.itemId,
      reason: args.reason,
      status: "pending",
    });

    return { success: true };
  },
});
