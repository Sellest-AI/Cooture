import { adminQuery } from "../../../procedures";

export const admin = adminQuery({
  // Was `({ ctx })` — adminQuery used to double-wrap its context, so handlers had to
  // reach through a nested `ctx.ctx` and never saw `ctx.user` / `ctx.userId` (03-FLAWS F5).
  handler: async (ctx) => {
    const users = await ctx.db.query('usersExtended')
      .order('desc')
      .take(64);

    return users.map((u) => ({ ...u, _id: u.userId }));
  }
})