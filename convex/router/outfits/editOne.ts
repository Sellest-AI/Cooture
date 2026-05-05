import { convertStringToTags, convertTagsToString } from "@/lib/helpers";
import { notEmpty, removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { extractPosition } from "../../functions/items";
import { ContentRating, isOutfitNFSW } from "../../functions/outfits";
import { isAuthorized } from "../../functions/users";
import { authMutation, QueryCtx } from "../../procedures";

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

export const authed = authMutation({
  args: {
    outfitId: v.id("outfits"),
    name: v.optional(v.string()),
    items: v.optional(v.array(v.id("items"))),
  },
  handler: async (ctx, args) => {
    await isAuthorized(ctx, args.outfitId);

    const hasBeenUsed = await ctx.db.query('presetGenerations')
      .withIndex('by_outfit_id', (q) => q.eq('outfitId', args.outfitId))
      .first();

    if (hasBeenUsed) return false;

    let contentRating: ContentRating | undefined = undefined;
    let tags: string[] = [];

    if (args.items !== undefined) {
      const existingOutfitItems = await ctx.db.query('outfitItems')
        .withIndex('by_outfit_id', (q) => q.eq('outfitId', args.outfitId))
        .collect();

      // Remove items that are no longer in the outfit
      const itemsToRemove = existingOutfitItems.filter(oi => !args.items!.includes(oi.itemId));
      for (const outfitItem of itemsToRemove) { await ctx.db.delete(outfitItem._id); }

      // Add new items to the outfit
      const itemsToAdd = args.items.filter(itemId => !existingOutfitItems.some(oi => oi.itemId === itemId));
      for (const itemId of itemsToAdd) { await ctx.db.insert('outfitItems', { outfitId: args.outfitId, itemId, }) }

      // Check if the outfit is NSFW after the changes
      const remainingItems = [...existingOutfitItems.map((i) => i.itemId), ...itemsToAdd].filter(oi => !itemsToRemove.some(r => r.itemId === oi));
      contentRating = await isOutfitNFSW(ctx, remainingItems);

      tags = await extractTags(ctx, remainingItems);

      if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
        await ctx.scheduler.runAfter(0, internal.router.outfits.updateCover._internal, { outfitId: args.outfitId });
      }
    }

    const tagsString = tags.length > 0 ? convertTagsToString(tags) : undefined;

    await ctx.db.patch(args.outfitId, removeUndefinedKeys({
      name: args.name,
      updatedAt: Date.now(),
      contentRating,
      tags: tagsString,
    }))

    return true;
  }
})