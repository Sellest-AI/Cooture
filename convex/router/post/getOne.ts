import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { getImage } from "../../../convex/functions/images";
import { getItem } from "../../../convex/functions/items/getItem";
import { publicQuery } from "../../../convex/procedures";

export const anon = publicQuery({
  args: {
    id: v.id("predictions")
  },
  handler: async (ctx, args) => {
    const prediction = await ctx.db.get(args.id);
    if (!prediction) return null;

    const [image, generation, generationPredictions] = await Promise.all([
      prediction.imageId ? getImage(ctx, prediction.imageId) : null,
      prediction.generationId ? ctx.db.get(prediction.generationId) : null,
      prediction.generationId ? ctx.db.query('predictions')
        .withIndex('by_generation_id', (q) => q.eq("generationId", prediction.generationId)).collect() : []
    ]);

    const metadata = generation ? await ctx.db.query('presetGenerations')
      .withIndex("by_generation_id", (q) => q.eq("generationId", generation._id))
      .unique() : null;

    const [preset, itemIds, user] = metadata ? await Promise.all([
      metadata.presetId ? ctx.db.get(metadata.presetId) : null,
      metadata.outfitId ? ctx.db.query('outfitItems').withIndex('by_outfit_id',
        (q) => q.eq("outfitId", metadata.outfitId!)).collect() : [],
      generation ? ctx.db.get(generation.userId) : null,
    ]) : [null, []];

    const presetCover = preset?.imageIds[0] ? await getImage(ctx, preset?.imageIds[0]) : null;
    const items = itemIds ? await Promise.all(itemIds.map((i) => getItem(ctx, i.itemId))) : [];

    const outfit = metadata?.outfitId ? {
      _id: metadata.outfitId,
      items: items.filter(notEmpty),
    } : null;

    return {
      user: user || null,
      image: image || null,
      ...metadata,
      ...prediction,
      generation: generation || null,
      generationPredictions,
      preset: preset ? {
        ...preset,
        cover: presetCover || null,
      } : null,
      outfit,
    }
  }
})