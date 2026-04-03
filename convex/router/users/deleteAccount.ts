import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { authMutation, internalMutation, MutationCtx } from "../../procedures";
import { BOOKMARK_TYPE } from "../../schema/collection";
import { LIKEABLE_TYPE } from "../../schema/likes";

const handler = async (ctx: MutationCtx, userId: Id<'users'>, options: { delayDays: number }) => {
  const userExtended = await ctx.db.query('usersExtended')
    .withIndex("by_user_id", q => q.eq("userId", userId))
    .first();

  if (!userExtended) return false;

  if (userExtended.deleteFunctionId)
    await ctx.scheduler.cancel(userExtended.deleteFunctionId);

  // Run after 30 days
  const functionId = await ctx.scheduler.runAfter(options.delayDays * 24 * 60 * 60 * 1000,
    internal.router.users.deleteAccount._internal_delay, { userId })

  await ctx.db.patch(userExtended._id, { deleteFunctionId: functionId })

  return true;
}

export const _internal = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => handler(ctx, userId, { delayDays: 1 })
})

export const authed = authMutation({
  handler: async (ctx) => handler(ctx, ctx.userId, { delayDays: 30 })
})

const deleteGenerations = async (ctx: MutationCtx, userId: Id<'users'>) => {
  // Get predictions and generations
  const generations = await ctx.db.query('generations')
    .withIndex('by_user_id', q => q.eq('userId', userId)).collect();

  const presetGenerations = await Promise.all(generations.map(generation => ctx.db.query('presetGenerations')
    .withIndex('by_generation_id', q => q.eq('generationId', generation._id)).collect()));

  const predictions = await Promise.all(generations.map(generation => ctx.db.query('predictions')
    .withIndex('by_generation_id', q => q.eq('generationId', generation._id)).collect()))
    .then(results => results.flat());

  // Delete generations
  await Promise.all(generations.map(generation => ctx.db.delete(generation._id)));
  await Promise.all(presetGenerations.flat().map(pg => ctx.db.delete(pg._id)));

  // Delete predictions
  await Promise.all(predictions.filter((p) => !!p.imageId).map(p =>
    ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId: p.imageId! })))
  await Promise.all(predictions.map(prediction => ctx.db.delete(prediction._id)));
}

const anonymizeUser = async (ctx: MutationCtx, userId: Id<'users'>) => {
  const userExtended = await ctx.db.query('usersExtended')
    .withIndex("by_user_id", q => q.eq("userId", userId)).first();

  const userAppearance = await ctx.db.query('usersAppearance')
    .withIndex("by_user_id", q => q.eq("userId", userId)).first();

  await ctx.db.patch(userId, { email: "", name: "", image: "", phone: "" });

  if (!userExtended) return;

  await ctx.db.patch(userExtended._id, { accountStatus: "DELETED", deleteFunctionId: undefined });

  await ctx.db.patch(userExtended._id, {
    firstName: "",
    lastName: "",
    name: "",
    username: "",
    imageId: undefined,
    imageUrl: undefined,
    // Subscription
    stripeCustomerId: "",
    revenueCatUserId: undefined,
    plan: undefined,
  });

  if (userExtended.imageId)
    await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId: userExtended.imageId });

  if (userAppearance) {
    await Promise.all([
      userAppearance.frontImageId,
      userAppearance.sideImageId,
      userAppearance.smileImageId,
    ].filter(notEmpty).map(imageId =>
      ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId })))

    await ctx.db.patch(userAppearance._id, {
      frontImageId: undefined,
      sideImageId: undefined,
      smileImageId: undefined,
      heightCm: undefined,
      gender: undefined,
      size: undefined,
    });
  }
}

const deleteUnusedPresets = async (ctx: MutationCtx, userId: Id<'users'>) => {
  const presets = await ctx.db.query('presets')
    .withIndex('by_user_id', q => q.eq('userId', userId)).collect();

  const presetGenerations = await Promise.all(presets.map(preset => ctx.db.query('presetGenerations')
    .withIndex('by_preset_id', q => q.eq('presetId', preset._id)).collect()));

  // If a preset has never been used in a generation, delete it and its associated images
  const unusedPresets = presets.filter((p) => presetGenerations.flat().some(pg => pg.presetId === p._id) === false);

  // Delete unused presets and their associated images
  await Promise.all(unusedPresets.map(async (preset) => {
    await Promise.all(preset.imageIds.map(imageId =>
      ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId })))
    await Promise.all(preset.depthMaps.map(imageId =>
      ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, { imageId })))
    await ctx.db.delete(preset._id);
  }));
}

const deleteBookmarks = async (ctx: MutationCtx, userId: Id<'users'>) => {
  const bookmarks = await Promise.all(BOOKMARK_TYPE.members.map(type => ctx.db.query('bookmarks')
    .withIndex('by_user_type', q => q.eq('userId', userId).eq('type', type.value)).collect()));

  await Promise.all(bookmarks.flat().map(async (b) => {
    const bookmarkStatsPromise = b.outfitId ? ctx.db.query('bookmarkStats')
      .withIndex('by_outfit_id', q => q.eq('outfitId', b.outfitId)) :
      b.itemId ? ctx.db.query('bookmarkStats')
        .withIndex('by_item_id', q => q.eq('itemId', b.itemId)) :
        b.generationId ? ctx.db.query('bookmarkStats')
          .withIndex('by_generation_id', q => q.eq('generationId', b.generationId)) :
          null;

    const bookmarkStats = bookmarkStatsPromise ? await bookmarkStatsPromise.first() : null;
    if (!bookmarkStats) return;

    await ctx.db.patch(bookmarkStats._id, {
      count: Math.max(0, bookmarkStats.count - 1),
      updatedAt: Date.now(),
    });
  }));

  await Promise.all(bookmarks.flat().map(b => ctx.db.delete(b._id)));
}

const deleteLikes = async (ctx: MutationCtx, userId: Id<'users'>) => {
  const likes = await Promise.all(LIKEABLE_TYPE.members.map(type => ctx.db.query('likes')
    .withIndex('by_user_type', q => q.eq('userId', userId).eq('type', type.value)).collect()));

  await Promise.all(likes.flat().map(async (l) => {
    const likeStatsPromise = l.outfitId ? ctx.db.query('likeStats')
      .withIndex('by_outfit_id', q => q.eq('outfitId', l.outfitId)) :
      l.generationId ? ctx.db.query('likeStats')
        .withIndex('by_generation_id', q => q.eq('generationId', l.generationId)) :
        null;

    const likeStats = likeStatsPromise ? await likeStatsPromise.first() : null;
    if (!likeStats) return;

    await ctx.db.patch(likeStats._id, {
      count: Math.max(0, likeStats.count - 1),
      updatedAt: Date.now(),
    });
  }));

  await Promise.all(likes.flat().map(l => ctx.db.delete(l._id)));
}

const deleteAccountData = async (ctx: MutationCtx, userId: Id<'users'>) => {
  // Delete Quests progress
  const quests = await ctx.db.query('quests').collect();
  const questsProgress = await Promise.all(quests.map(q => ctx.db.query('userQuestProgress')
    .withIndex('by_user_and_quest', qp => qp.eq('userId', userId).eq('questId', q._id)).collect()));
  await Promise.all(questsProgress.flat().map(qp => ctx.db.delete(qp._id)));

  // Waitlist codes
  const waitlistCodes = await ctx.db.query('waitlistCodes')
    .withIndex('by_user_id', q => q.eq('userId', userId)).collect();
  await Promise.all(waitlistCodes.map(c => ctx.db.delete(c._id)));
}

const deleteFollows = async (ctx: MutationCtx, userId: Id<'users'>) => {
  // User follows other people: decrement their followersCount
  const follows = await ctx.db.query('follows')
    .withIndex('by_follower', q => q.eq('followerId', userId)).collect();

  await Promise.all(follows.map(async (f) => {
    const followStats = await ctx.db.query('followStats')
      .withIndex('by_user_id', q => q.eq('userId', f.followingId)).first();

    if (followStats)
      await ctx.db.patch(followStats._id, {
        followersCount: Math.max(0, followStats.followersCount - 1),
        updatedAt: Date.now(),
      });

    await ctx.db.delete(f._id);
  }));

  // Other people follow this user: decrement their followingCount
  const following = await ctx.db.query('follows')
    .withIndex('by_following', q => q.eq('followingId', userId)).collect();

  await Promise.all(following.map(async (f) => {
    const followStats = await ctx.db.query('followStats')
      .withIndex('by_user_id', q => q.eq('userId', f.followerId)).first();

    if (followStats)
      await ctx.db.patch(followStats._id, {
        followingCount: Math.max(0, followStats.followingCount - 1),
        updatedAt: Date.now(),
      });

    await ctx.db.delete(f._id);
  }));

  const followStats = await ctx.db.query('followStats')
    .withIndex('by_user_id', q => q.eq('userId', userId)).collect();
  await Promise.all(followStats.map(f => ctx.db.delete(f._id)));
}

const deleteNotifications = async (ctx: MutationCtx, userId: Id<'users'>) => {
  const notifications = await ctx.db.query('notifications')
    .withIndex('by_user_id', q => q.eq('userId', userId)).collect();
  await Promise.all(notifications.map(n => ctx.db.delete(n._id)));

  const pushTokens = await ctx.db.query('pushTokens')
    .withIndex('by_user_id', q => q.eq('userId', userId)).collect();
  await Promise.all(pushTokens.map(t => ctx.db.delete(t._id)));
}

export const _internal_delay = internalMutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    await anonymizeUser(ctx, userId);

    await deleteNotifications(ctx, userId);

    await deleteAccountData(ctx, userId);

    await deleteFollows(ctx, userId);

    await deleteGenerations(ctx, userId);

    await deleteUnusedPresets(ctx, userId);

    await deleteBookmarks(ctx, userId);

    await deleteLikes(ctx, userId);

    // For now we keep the items & outfits because they can be reused by other users
    // Items & Outfits are anonymous anyway
  }
})