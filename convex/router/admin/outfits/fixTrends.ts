import { convertStringToTags, convertTagsToString } from "@/lib/helpers";
import { notEmpty } from "@shared/utils";
import { Id } from "../../../_generated/dataModel";
import { extractPosition } from "../../../functions/items";
import { internalMutation, QueryCtx } from "../../../procedures";

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
    // Make sure an item can't count for the same tag twice
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
  handler: async (ctx) => {
    const outfits = await ctx.db.query("outfits").order('desc').collect();

    for (const outfit of outfits) {
      const outfitItems = await ctx.db.query('outfitItems')
        .withIndex('by_outfit_id', (q) => q.eq('outfitId', outfit._id))
        .collect();

      const itemIds = outfitItems.map((oi) => oi.itemId);
      const trendTags = await extractTags(ctx, itemIds);
      const tags = trendTags.length > 0 ? convertTagsToString(trendTags) : undefined;

      await ctx.db.patch(outfit._id, {
        tags,
      });
    }
  }
})