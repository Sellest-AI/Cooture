import { authQuery } from "../../../procedures";

export const authed = authQuery({
  args: {}, handler: async (ctx) => {
    const userImage = await ctx.db.query('userImages')
      .withIndex('by_user_id', q => q.eq('userId', ctx.userId))
      .order('desc')
      .first();

    if (!userImage) return null;
    return ctx.db.get(userImage.imageId);

  }
})


