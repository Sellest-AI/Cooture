import { notEmpty } from '@shared/utils';
import { v } from 'convex/values';
import { searchItems } from '../../functions/items';
import { getItem } from '../../functions/items/getItem';
import { publicQuery } from '../../procedures';

export const anon = publicQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await searchItems(ctx, args.query, { amount: 20 });
    return (await Promise.all(items.map(async (item) => getItem(ctx, item)))).filter(notEmpty);
  }
});
