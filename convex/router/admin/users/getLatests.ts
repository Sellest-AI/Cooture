import { adminQuery } from "../../../procedures";

export const admin = adminQuery({
  handler: async ({ ctx }) => {
    const users = await ctx.db.query('usersExtended')
      .order('desc')
      .take(64);

    return users.map((u) => ({ ...u, _id: u.userId }));
  }
})