import { paginationOptsValidator } from "convex/server";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("users")
      .paginate(args.paginationOpts);

    const users = result.page
      .filter((user) => user._id !== ctx.userId)
      .map((user) => ({
        ...user,
        username: user.name,
      }))

    return {
      ...result,
      page: users
    }
  }
})