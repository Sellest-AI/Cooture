import { v } from "convex/values";
import { publicQuery } from "../../../convex/procedures";
import { getGenerationMax } from "../../functions/generations";

export const anon = publicQuery({
  args: {
    id: v.id("predictions")
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.id);
    if (!prediction?.generationId) return null;
    return getGenerationMax(ctx, prediction.generationId);
  }
})