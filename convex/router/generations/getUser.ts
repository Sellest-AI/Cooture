import { v } from "convex/values";
import { internalQuery } from "../../procedures";

export const _internal = internalQuery({
  args: {
    predictionId: v.string(),
  },
  handler: async (ctx, args) => {
    const { predictionId } = args;
    const prediction = await ctx.db.query("predictions").withIndex("by_prediction_id", (q) =>
      q.eq("predictionId", predictionId)).first();

    if (!prediction) { throw new Error(`Prediction with id ${predictionId} not found`); }
    if (!prediction.generationId) { throw new Error(`Prediction with id ${predictionId} has no generationId`); }

    const generation = await ctx.db.get(prediction.generationId);
    if (!generation) { throw new Error(`Generation with id ${prediction.generationId} not found`); }

    return generation.userId;
  }
})