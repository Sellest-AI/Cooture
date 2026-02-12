import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
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
  },
  handler: async (ctx, { paginationOpts }) => {
    const scores = await ctx.db.query('feedScores')
      .withIndex('by_score').order('desc')
      .filter(q => q.eq(q.field('archived'), false))
      .paginate(paginationOpts);

    const feed: Post<Type>[] = scores.page.map((item) => {
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