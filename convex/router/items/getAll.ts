import { notEmpty } from "@shared/utils";
import { getImage } from "../../functions/images";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("items")
      .withIndex('by_user_id', q => q.eq('userId', ctx.userId))
      .collect();

    const detailedItems = await Promise.all(items.map(async (item) => {
      const image = await getImage(ctx, item.imageId);
      if (!image) return null;
      return {
        ...item,
        image
      }
    }));

    return detailedItems.filter(notEmpty);
  }
})