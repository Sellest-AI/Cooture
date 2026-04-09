import { notEmpty } from "@shared/utils";
import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";
import { getItem } from "../items/getItem";
import { getUserPublic } from "../users";

const checkIfVideosOnly = (predictions: Doc<'predictions'>[]) => {
  const completedPredictions = predictions.filter((p) => p.status === 'ACCEPTED' || p.status === 'REJECTED');
  const pendingPredictions = predictions.filter((p) => p.status === 'LOADING');

  const completedAreVideos = completedPredictions.length === 0 ||
    completedPredictions.every((p) => !!p.videoId);
  const pendingAreVideos = pendingPredictions.length === 0 ||
    pendingPredictions.every((p) => !!p.imageId);

  return completedAreVideos && pendingAreVideos;
}

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
  ])).map(id => getUserPublic(ctx, id)));

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
    username: _user.username,
    image: _user.image,
    isPremium: _user.isPremium,
  } : null;

  const sanitizedUser = sanitizeUser(user);
  const sanitizedUsers = (users ?? []).map(sanitizeUser).filter(notEmpty);

  const coverId = predictions[0].imageId ?? predictions.find((x) => x.imageId)?.imageId;
  const firstPredictionId = predictions[0]._id;

  const isVideosOnly = checkIfVideosOnly(predictions);

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
      // Sanitize sensitive data
      prompts: undefined,
      cover: presetCover || null,
    } : null,
    outfit,
    isVideosOnly
  }
}