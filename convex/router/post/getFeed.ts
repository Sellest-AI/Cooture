import { FeedAlgorithm } from "@/lib/algorithms/feedSuffler";
import { Id } from "../../_generated/dataModel";
import { publicQuery } from "../../procedures";

type Result = ((
  { type: 'post', _id: Id<'predictions'> } |
  { type: 'outfit', _id: Id<'outfits'> }) &
{ _creationTime: number })[];

export const anon = publicQuery({
  handler: async (ctx): Promise<Result> => {
    const predictions = await ctx.db.query('predictions')
      .withIndex('status', (q) => q.eq('status', 'ACCEPTED')).order('desc')
      .take(20);

    const outfits = await ctx.db.query('outfits')
      .order('desc')
      .take(20);

    const algorithm = new FeedAlgorithm({
      shuffleStrength: 0.3,      // 30% randomness
      minPostsBetweenOutfits: 4, // At least 4 posts between outfits
      recencyDecay: 0.5          // How quickly older items lose priority
    })

    const feed = algorithm.generateFeed<string>([
      ...predictions.map((p) => ({
        type: 'post' as const,
        _creationTime: p._creationTime,
        _id: p._id
      })),
      ...outfits.map((o) => ({
        type: 'outfit' as const,
        _creationTime: o._creationTime,
        _id: o._id
      }))
    ])
      .map((item) => {
        if (item.type === 'post')
          return {
            type: item.type,
            _id: item._id as Id<'predictions'>,
            _creationTime: item._creationTime,
          }

        return {
          type: item.type,
          _id: item._id as Id<'outfits'>,
          _creationTime: item._creationTime,
        }
      })

    return feed;
  }
})