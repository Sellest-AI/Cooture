import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { authAction } from "../../procedures";

export const authed = authAction({
  args: {
    presetId: v.id("presets"),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args) => {
    const portraits = await ctx.runQuery(internal.router.users.getPortraits._internal, { userId: ctx.userId });
    if (!portraits) throw new Error("User portraits not found");


  }
})