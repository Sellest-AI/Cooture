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
  userId: Id<'users'>;
} : T extends 'outfit' ? {
  type: 'outfit';
  _id: Id<'outfits'>;
  _creationTime: number;
  userId: Id<'users'>;
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

    const allScores = [...scores.page]
      .sort((a, b) => b.score - a.score)
      // Filter duplicates
      .filter((score, index, self) => index === self.findIndex((s) => s._id === score._id));

    const feed: Post<Type>[] = allScores.map((item) => {
      if (item.generationId)
        return {
          type: 'generation' as const,
          _id: item.generationId,
          _creationTime: item._creationTime,
          userId: item.userId,
        }

      if (item.outfitId)
        return {
          type: 'outfit' as const,
          _id: item.outfitId,
          _creationTime: item._creationTime,
          userId: item.userId,
        }

      return null;
    }).filter(notEmpty);

    return { ...scores, page: feed };
  }
})