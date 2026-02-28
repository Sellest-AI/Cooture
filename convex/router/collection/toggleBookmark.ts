import { ConvexError, v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { authMutation, internalMutation, MutationCtx } from "../../procedures";
import { BOOKMARK_TYPE } from "../../schema/collection";

const extractType = <T extends (typeof BOOKMARK_TYPE)['type']>(args: { generationId?: Id<'generations'>; outfitId?: Id<'outfits'>; itemId?: Id<'items'> }): T => {
  if (args.generationId) return "generation" as T;
  if (args.outfitId) return "outfit" as T;
  if (args.itemId) return "item" as T;
  throw new ConvexError("Exactly one of generationId, outfitId, or itemId must be provided");
}

const toggleBookmark = async (ctx: MutationCtx, args: {
  value?: boolean;
  userId: Id<'users'>;
  generationId?: Id<'generations'>;
  outfitId?: Id<'outfits'>;
  itemId?: Id<'items'>;
}) => {
  const { generationId, outfitId, itemId, userId } = args;

  // Validate exactly one ID is provided
  const providedIds = [generationId, outfitId, itemId].filter(Boolean);
  if (providedIds.length !== 1)
    throw new ConvexError("Exactly one of generationId, outfitId, or itemId must be provided");

  const type = extractType(args);

  // Check if bookmark already exists
  let existing = null;
  if (generationId) {
    existing = await ctx.db
      .query("bookmarks").withIndex("by_user_generation", (q) =>
        q.eq("userId", userId).eq("generationId", generationId)).first();
  } else if (outfitId) {
    existing = await ctx.db
      .query("bookmarks").withIndex("by_user_outfit", (q) =>
        q.eq("userId", userId).eq("outfitId", outfitId)).first();
  } else if (itemId) {
    existing = await ctx.db
      .query("bookmarks").withIndex("by_user_item", (q) =>
        q.eq("userId", userId).eq("itemId", itemId)).first();
  }

  if (existing && args.value === true) return;
  if (!existing && args.value === false) return;

  if (existing) {
    // Remove bookmark
    await ctx.db.delete(existing._id);
    // Update stats - decrement count
    await updateBookmarkStats(ctx, { generationId, outfitId, itemId }, -1);
    return { bookmarked: false };
  } else {
    // Add bookmark
    await ctx.db.insert("bookmarks", {
      userId: userId,
      generationId,
      outfitId,
      itemId,
      type,
    });
    // Update stats - increment count
    await updateBookmarkStats(ctx, { generationId, outfitId, itemId }, 1);
    return { bookmarked: true };
  }
}

export const _internal = internalMutation({
  args: {
    value: v.optional(v.boolean()),
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
    itemId: v.optional(v.id("items")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => toggleBookmark(ctx, { ...args })
});

export const authed = authMutation({
  args: {
    value: v.optional(v.boolean()),
    generationId: v.optional(v.id("generations")),
    outfitId: v.optional(v.id("outfits")),
    itemId: v.optional(v.id("items")),
  },
  handler: async (ctx, args) => toggleBookmark(ctx, { ...args, userId: ctx.userId })
});

async function updateBookmarkStats(
  ctx: MutationCtx,
  target: {
    generationId?: Id<'generations'>;
    outfitId?: Id<'outfits'>;
    itemId?: Id<'items'>;
  },
  increment: number
) {
  const { generationId, outfitId, itemId } = target;
  const type = extractType(target);

  let existingStats = null;
  if (generationId) {
    existingStats = await ctx.db
      .query("bookmarkStats")
      .withIndex("by_generation_id", (q) => q.eq("generationId", generationId))
      .first();
  } else if (outfitId) {
    existingStats = await ctx.db
      .query("bookmarkStats")
      .withIndex("by_outfit_id", (q) => q.eq("outfitId", outfitId))
      .first();
  } else if (itemId) {
    existingStats = await ctx.db
      .query("bookmarkStats")
      .withIndex("by_item_id", (q) => q.eq("itemId", itemId))
      .first();
  }

  if (existingStats) {
    // Update existing stats
    const newCount = Math.max(0, existingStats.count + increment);
    await ctx.db.patch(existingStats._id, {
      count: newCount,
      updatedAt: Date.now(),
    });
  } else if (increment > 0) {
    // Create new stats entry (only when adding a bookmark)
    await ctx.db.insert("bookmarkStats", {
      type,
      generationId,
      outfitId,
      itemId,
      count: increment,
      updatedAt: Date.now(),
    });
  }
}
