import { notEmpty } from "@shared/utils";
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";
import { getItem } from "../items/getItem";

export const getGenerationMax = async (ctx: QueryCtx, generationId: Id<'generations'>) => {
  const generation = await ctx.db.get(generationId);
  if (!generation) return null;

  const predictions = await ctx.db.query("predictions").withIndex("by_generation_id", (q) =>
    q.eq("generationId", generationId)).collect();

  const metadata = generation ? await ctx.db.query('presetGenerations')
    .withIndex("by_generation_id", (q) => q.eq("generationId", generation._id))
    .unique() : null;

  const [preset, itemIds, user] = metadata ? await Promise.all([
    metadata.presetId ? ctx.db.get(metadata.presetId) : null,
    metadata.outfitId ? ctx.db.query('outfitItems').withIndex('by_outfit_id',
      (q) => q.eq("outfitId", metadata.outfitId!)).collect() : [],
    generation ? ctx.db.get(generation.userId) : null,
  ]) : [null, []];

  const [presetCover, items] = await Promise.all([
    preset?.imageIds[0] ? await getImage(ctx, preset?.imageIds[0]) : null,
    itemIds ? await Promise.all(itemIds.map((i) => getItem(ctx, i.itemId))) : [],
  ]);

  const outfit = metadata?.outfitId ? {
    _id: metadata.outfitId,
    items: items.filter(notEmpty),
  } : null;

  const sanitizedUser = user ? {
    _id: user._id,
    name: user.name,
    username: user.name,
    image: user.image,
  } : null;

  return {
    user: sanitizedUser,
    ...metadata,
    ...generation,
    predictions,
    preset: preset ? {
      ...preset,
      cover: presetCover || null,
    } : null,
    outfit,
  }
}