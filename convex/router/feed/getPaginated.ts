import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { publicQuery } from "../../procedures";

type Type = 'generation' | 'outfit';
type Post<T extends Type> = T extends 'generation' ? {
  type: 'generation';
  _id: Id<'generations'>;
  _creationTime: number;
} : T extends 'outfit' ? {
  type: 'outfit';
  _id: Id<'outfits'>;
  _creationTime: number;
} : never;

export const anon = publicQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    maxAge: v.number(),
  },
  handler: async (ctx, { paginationOpts, maxAge }) => {
    const scores = await ctx.db.query('feedScores')
      .withIndex('by_archived_score', (q) => q.eq('archived', false))
      .order('desc')
      .filter((q) => q.lte(q.field('_creationTime'), maxAge))
      .paginate(paginationOpts);

    // ⚠️ Fallback to get more items if we don't have enough items
    // This can happen if the algorithm sucks and too much newest posts have Bigger scores than Older TRENDING posts
    // For example if we retrieve 30 items but users created 100 in the last minute and they have bigger scores than TRENDING posts
    // Then it will search through ALL the database, so we need to Monitor this and fix it ⚠️
    const extra = scores.page.length > 0 ? [] : (await ctx.db.query('feedScores')
      .withIndex('by_creation_time', (q) => q.lte('_creationTime', maxAge))
      .order('desc')
      .paginate(paginationOpts)).page;

    const allScores = [...scores.page, ...extra]
      .sort((a, b) => b.score - a.score)
      // Filter duplicates
      .filter((score, index, self) => index === self.findIndex((s) => s._id === score._id));

    const feed: Post<Type>[] = allScores.map((item) => {
      if (item.generationId)
        return {
          type: 'generation' as const,
          _id: item.generationId,
          _creationTime: item._creationTime,
        }

      if (item.outfitId)
        return {
          type: 'outfit' as const,
          _id: item.outfitId,
          _creationTime: item._creationTime,
        }

      return null;
    }).filter(notEmpty);


    return { ...scores, page: feed };
  }
})