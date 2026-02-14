import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";

export const getGenerationDetails = async (ctx: QueryCtx, generationId: Id<"generations">) => {
  const [predictions, metadata] = await Promise.all([
    ctx.db.query('predictions')
      .withIndex("by_generation_id", (q) => q.eq("generationId", generationId))
      .collect(),
    ctx.db.query('presetGenerations')
      .withIndex('by_generation_id', q => q.eq('generationId', generationId)).first()
  ]);

  const cover = predictions.find((p) => p.status === "ACCEPTED") ?? predictions[0] ?? null;

  return {
    coverId: cover?.imageId,
    predictions,
    metadata,
  }
}