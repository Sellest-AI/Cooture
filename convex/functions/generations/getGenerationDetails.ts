import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getPredictions } from "./getPrediction";

export const getGenerationDetails = async (ctx: QueryCtx, generationId: Id<"generations">) => {
  const [predictions, metadata] = await Promise.all([
    getPredictions(ctx, generationId),
    ctx.db.query('presetGenerations')
      .withIndex('by_generation_id', q => q.eq('generationId', generationId)).first()
  ]);

  const cover = predictions.find((p) => p.status === "ACCEPTED") ?? predictions[0] ?? null;

  return {
    cover: cover?.image,
    predictions,
    metadata,
  }
}