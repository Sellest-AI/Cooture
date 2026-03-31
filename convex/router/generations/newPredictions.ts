import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { createPrediction } from "../../functions/generations";
import { internalMutation } from "../../procedures";

export const _internal = internalMutation({
  args: {
    generationId: v.id("generations"),
    predictions: v.array(v.object({
      id: v.string(),
      baseImageId: v.optional(v.id("images")),
    })),
  },
  handler: async (ctx, { predictions, generationId }): Promise<Id<'generations'>> => {
    const generation = await ctx.db.get(generationId);
    if (!generation) throw new Error("Generation not found");

    await ctx.db.patch(generationId, {
      status: "LOADING",
      publication: "DRAFT",
    });

    await Promise.all(predictions.map(prediction => createPrediction(ctx, {
      predictionId: prediction.id,
      imageId: prediction.baseImageId,
      generationId,
      status: 'LOADING',
    })));

    return generationId;
  }
})