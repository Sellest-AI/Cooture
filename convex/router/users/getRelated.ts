import { paginationOptsValidator } from "convex/server";
import { getUserPublic } from "../../functions/users";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("users")
      .paginate(args.paginationOpts);

    const users = await Promise.all(result.page
      .filter((user) => user._id !== ctx.userId)
      .map((user) => getUserPublic(ctx, user._id)))

    return {
      ...result,
      page: users
    }
  }
})