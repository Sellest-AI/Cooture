import { paginationOptsValidator } from "convex/server";
import { authQuery } from "../../procedures";
import { BOOKMARK_TYPE } from "../../schema/collection";

export const authed = authQuery({
  args: {
    type: BOOKMARK_TYPE,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { type, paginationOpts }) => {
    const userId = ctx.userId;

    const bookmarks = await ctx.db.query('bookmarks')
      .withIndex('by_user_type', q => q.eq('userId', userId).eq('type', type))
      .order('desc')
      .paginate(paginationOpts);

    return bookmarks;
  }
})