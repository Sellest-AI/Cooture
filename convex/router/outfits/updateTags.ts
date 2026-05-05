import { convertStringToTags, convertTagsToString } from "@/lib/helpers";
import { notEmpty, removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { extractPosition } from "../../functions/items";
import { internalMutation, QueryCtx } from "../../procedures";

const extractTags = async (ctx: QueryCtx, itemIds: Id<'items'>[]): Promise<string[]> => {
  const items = await Promise.all(itemIds.map((id) => ctx.db.get(id)));
  const importantItems = items.filter(notEmpty).filter((i) => {
    const position = extractPosition(i.category);
    if (position === 'TOP') return true;
    if (position === 'OUTERWEAR') return true;
    if (position === 'ACCESSORY') return true;
    if (position === 'INNERLAYER') return true;
    return false;
  })

  const tags = importantItems.map((i) => i?.trendTags)
    .filter(notEmpty).map((t) => convertStringToTags(t));

  // We want to check each array of tags, and only keep the tags that are present in 30% of the items or more
  const tagCount: Record<string, number> = {};
  tags.forEach((itemTags) => {
    // Make sure an item can't count for the same tag twice using a Set
    const uniqueItemTags = [...new Set(itemTags)];
    uniqueItemTags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  const threshold = Math.ceil(importantItems.length * 0.3);
  const commonTags = Object.keys(tagCount).filter((tag) => tagCount[tag] >= threshold);
  return commonTags;
}

export const _internal = internalMutation({
  args: {
    outfitId: v.id("outfits"),
  },
  handler: async (ctx, args) => {
    const outfitItems = await ctx.db.query('outfitItems')
      .withIndex('by_outfit_id', (q) => q.eq('outfitId', args.outfitId))
      .collect();

    const tags = await extractTags(ctx, outfitItems.map((o) => o.itemId));
    const tagsString = tags.length > 0 ? convertTagsToString(tags) : undefined;

    if (!tagsString) return;

    await ctx.db.patch(args.outfitId, removeUndefinedKeys({
      updatedAt: Date.now(),
      tags: tagsString,
    }))

  }
})