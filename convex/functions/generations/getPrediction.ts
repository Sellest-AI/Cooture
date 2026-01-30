import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";

export const getPredictions = async (ctx: QueryCtx, generationId: Id<'generations'>) => {
  const predictions = await ctx.db.query("predictions").withIndex("by_generation_id", (q) =>
    q.eq("generationId", generationId)).collect();

  const images = await Promise.all(predictions.filter((p) => !!p.imageId).
    map(p => getImage(ctx, p.imageId!)));

  return predictions.map(prediction => {
    const image = images.find(img => img && img._id === prediction.imageId);
    return {
      ...prediction,
      image: image || null,
      hasImage: !!image,
    }
  });
}