import { notEmpty } from '@shared/utils';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { searchItems } from '../../functions/items';
import { getOutfit } from '../../functions/outfits';
import { authQuery, publicQuery, QueryCtx } from '../../procedures';

const searchOutfits = async (ctx: QueryCtx, query: string, userId?: Id<'users'>) => {
  const safeQuery = query.trim();
  if (safeQuery.length === 0) {
    const q = !userId ? ctx.db.query('outfits') :
      ctx.db.query('outfits').withIndex('by_user_id', (idx) => idx.eq('userId', userId));
    const recentOutfits = await q.order('desc').take(20);
    return (await Promise.all(recentOutfits.map((o) => getOutfit(ctx, o._id)))).filter(notEmpty);
  }

  const tagsQuery = userId
    ? ctx.db.query('outfits').withSearchIndex('search_tags', (q) => q.search('tags', safeQuery).eq('userId', userId))
    : ctx.db.query('outfits').withSearchIndex('search_tags', (q) => q.search('tags', safeQuery));

  const [tagMatchedOutfits, items] = await Promise.all([
    tagsQuery.take(50),
    searchItems(ctx, safeQuery, { amount: 50, userId }),
  ]);

  const outfitScores = new Map<Id<'outfits'>, number>();

  for (const outfit of tagMatchedOutfits) {
    outfitScores.set(outfit._id, 3); // High base score for direct tag matches
  }

  for (const item of items) {
    const links = await ctx.db
      .query('outfitItems')
      .withIndex('by_item_id', (q) => q.eq('itemId', item._id))
      .collect();

    for (const link of links) {
      const currentScore = outfitScores.get(link.outfitId) || 0;
      outfitScores.set(link.outfitId, currentScore + 1);
    }
  }

  const sortedOutfitIds = Array.from(outfitScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([outfitId]) => outfitId);

  const resolvedOutfits = [];
  for (const id of sortedOutfitIds) {
    const outfitDoc = await ctx.db.get(id);
    // Filter outfits based on userId if provided
    if (outfitDoc && (!userId || outfitDoc.userId === userId)) {
      const outfit = await getOutfit(ctx, id);
      if (outfit) {
        resolvedOutfits.push(outfit);
        if (resolvedOutfits.length >= 20) break;
      }
    }
  }

  return resolvedOutfits;
};

export const anon = publicQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    return searchOutfits(ctx, args.query);
  },
});

export const authed = authQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    return searchOutfits(ctx, args.query, ctx.user._id);
  },
});
