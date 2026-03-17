import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";

type Args = {
  amount?: number;
  userId?: Id<"users">;
}

const DEFAULT_ARGS: Args = {
  amount: 20,
}

export const searchItems = async (ctx: QueryCtx, query: string, args?: Args) => {
  const { amount = 20, userId } = (args ?? DEFAULT_ARGS);

  const [byName, byBrand, byDescription] = await Promise.all([
    ctx.db.query('items')
      .withSearchIndex('search_name', (q) => {
        const search = q.search('name', query);
        return userId ? search.eq('userId', userId) : search;
      })
      .take(amount),
    ctx.db.query('items')
      .withSearchIndex('search_brand', (q) => {
        const search = q.search('brand', query);
        return userId ? search.eq('userId', userId) : search;
      })
      .take(amount),
    ctx.db.query('items')
      .withSearchIndex('search_description', (q) => {
        const search = q.search('description', query);
        return userId ? search.eq('userId', userId) : search;
      })
      .take(amount),
  ]);

  const results = byName.concat(byBrand).concat(byDescription).reduce((acc, item) => {
    if (acc.find(i => i._id === item._id)) {
      return acc;
    }
    return [...acc, item];
  }, [] as Doc<'items'>[]);

  return results;
}