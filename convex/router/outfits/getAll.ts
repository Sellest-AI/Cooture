import { notEmpty } from "@shared/utils";
import { getImage } from "../../functions/images";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {},
  handler: async (ctx) => {
    const outfits = await ctx.db.query("outfits")
      .withIndex('by_user_id', q => q.eq('userId', ctx.userId))
      .order('desc')
      .collect();

    const detailedOutfits = await Promise.all(outfits.map(async (outfit) => {
      const items = await ctx.db.query('outfitItems')
        .withIndex('by_outfit_id', q => q.eq('outfitId', outfit._id)).collect();
      if (items.length === 0) return null;
      const item = await ctx.db.get(items[0].itemId);
      if (!item) return null;
      const image = await getImage(ctx, item.imageId);
      if (!image) return null;
      return {
        ...outfit,
        items,
        itemsCount: items.length,
        cover: image
      }
    }));

    return detailedOutfits.filter(notEmpty);
  }
})