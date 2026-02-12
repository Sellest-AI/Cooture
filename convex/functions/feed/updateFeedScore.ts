import { Id } from "../../_generated/dataModel";
import { MutationCtx } from "../../procedures";
import { FEED_CONFIG } from "./feed.config";

type Args = {
  archive?: boolean,
} & ({ generationId: Id<'generations'> } | { outfitId: Id<'outfits'> });

export const upsertFeedScore = async (ctx: MutationCtx, args: Args) => {
  // Type guard to check which ID we have
  const generationId = 'generationId' in args ? args.generationId : null;
  const outfitId = 'outfitId' in args ? args.outfitId : null;

  const feedScore = generationId ?
    await ctx.db.query('feedScores')
      .withIndex('by_generation_id', (q) => q.eq('generationId', generationId))
      .first() :
    await ctx.db.query('feedScores')
      .withIndex('by_outfit_id', (q) => q.eq('outfitId', outfitId!))
      .first();

  // If archive flag is set, mark the post as archived and return
  if (args.archive === true) {
    if (!feedScore) return;
    await ctx.db.patch(feedScore._id, { archived: true, updatedAt: Date.now() });
    return;
  }

  if (!feedScore) {
    const userId = (await ctx.db.get(generationId || outfitId!))?.userId;
    if (!userId) return;

    await ctx.db.insert('feedScores', {
      generationId: generationId ?? undefined,
      outfitId: outfitId ?? undefined,
      score: FEED_CONFIG.DEFAULT_SCORE,
      updatedAt: Date.now(),
      userId: userId,
      archived: false,
    });
  }

  // If the post already exists and is archived, unarchive it
  if (feedScore?.archived)
    await ctx.db.patch(feedScore._id, { archived: false, updatedAt: Date.now() });
}