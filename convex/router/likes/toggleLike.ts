import { ConvexError, v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { authMutation, internalMutation, MutationCtx } from "../../procedures";
import { LIKEABLE_TYPE } from "../../schema/likes";

const extractType = <T extends (typeof LIKEABLE_TYPE)['type']>(args: { generationId?: Id<'generations'>; outfitId?: Id<'outfits'> }): T => {
  if (args.generationId) return "generation" as T;
  if (args.outfitId) return "outfit" as T;
  throw new ConvexError("Exactly one of generationId or outfitId must be provided");
}

const args = {
  value: v.optional(v.boolean()),
  generationId: v.optional(v.id("generations")),
  outfitId: v.optional(v.id("outfits")),
}

const sharedFunction = async (ctx: MutationCtx, args: { userId: Id<'users'>, value?: boolean, generationId?: Id<'generations'>, outfitId?: Id<'outfits'> }) => {
  const { generationId, outfitId } = args;

  // Validate exactly one ID is provided
  const providedIds = [generationId, outfitId].filter(Boolean);
  if (providedIds.length !== 1)
    throw new ConvexError("Exactly one of generationId or outfitId must be provided");

  const type = extractType(args);

  // Check if like already exists
  let existing = null;
  if (generationId) {
    existing = await ctx.db
      .query("likes").withIndex("by_user_generation", (q) =>
        q.eq("userId", args.userId).eq("generationId", generationId)).first();
  } else if (outfitId) {
    existing = await ctx.db
      .query("likes").withIndex("by_user_outfit", (q) =>
        q.eq("userId", args.userId).eq("outfitId", outfitId)).first();
  }

  if (existing && args.value === true) return;

  if (existing) {
    // Remove like
    await ctx.db.delete(existing._id);
    // Schedule stats update
    await updateStats(ctx, { generationId, outfitId }, -1);
    return { liked: false };
  } else {
    // Add like
    await ctx.db.insert("likes", {
      userId: args.userId,
      generationId,
      outfitId,
      type,
      createdAt: Date.now(),
    });
    // Schedule stats update
    await updateStats(ctx, { generationId, outfitId }, 1);
    return { liked: true };
  }
}

async function updateStats(
  ctx: MutationCtx,
  target: {
    generationId?: Id<'generations'>;
    outfitId?: Id<'outfits'>;
  },
  increment: number
) {
  const { generationId, outfitId } = target;
  const type = extractType(target);

  let existingStats = null;
  if (generationId) {
    existingStats = await ctx.db
      .query("likeStats")
      .withIndex("by_generation_id", (q) => q.eq("generationId", generationId))
      .first();
  } else if (outfitId) {
    existingStats = await ctx.db
      .query("likeStats")
      .withIndex("by_outfit_id", (q) => q.eq("outfitId", outfitId))
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
    // Create new stats entry (only when adding a like)
    await ctx.db.insert("likeStats", {
      type,
      generationId,
      outfitId,
      count: increment,
      updatedAt: Date.now(),
    });
  }
}

export const _internal = internalMutation({
  args: { ...args, userId: v.id('users') },
  handler: async (ctx, args) => sharedFunction(ctx, args)
})

export const authed = authMutation({
  args,
  handler: async (ctx, args) => sharedFunction(ctx, { ...args, userId: ctx.userId })
});
