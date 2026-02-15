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

  // If there is metadata, we need to fetch the users, otherwise we can skip it
  const usersPromise = Promise.all(Array.from(new Set([
    generation.userId, ...(metadata?.userIds ?? []),
  ])).map(id => ctx.db.get(id)));

  const [preset, itemIds, users] = metadata ? await Promise.all([
    metadata.presetId ? ctx.db.get(metadata.presetId) : null,
    metadata.outfitId ? ctx.db.query('outfitItems').withIndex('by_outfit_id',
      (q) => q.eq("outfitId", metadata.outfitId!)).collect() : [],
    usersPromise,
  ]) : [null, []];

  const [presetCover, items] = await Promise.all([
    preset?.imageIds[0] ? await getImage(ctx, preset?.imageIds[0]) : null,
    itemIds ? await Promise.all(itemIds.map((i) => getItem(ctx, i.itemId))) : [],
  ]);

  const outfit = metadata?.outfitId ? {
    _id: metadata.outfitId,
    items: items.filter(notEmpty),
  } : null;

  const user = (users ?? []).find(u => u?._id === generation.userId);
  const sanitizeUser = (_user: typeof user) => _user ? {
    _id: _user._id,
    name: _user.name,
    username: _user.name,
    image: _user.image,
  } : null;

  const sanitizedUser = sanitizeUser(user);
  const sanitizedUsers = (users ?? []).map(sanitizeUser).filter(notEmpty);

  const coverId = predictions[0].imageId ?? predictions.find((x) => x.imageId)?.imageId;
  const firstPredictionId = predictions[0]._id;

  return {
    firstPredictionId,
    user: sanitizedUser,
    users: sanitizedUsers,
    ...metadata,
    ...generation,
    predictions,
    coverId,
    preset: preset ? {
      ...preset,
      cover: presetCover || null,
    } : null,
    outfit,
  }
}