import { v } from "convex/values";
import { authQuery, publicQuery, QueryCtx } from "../../procedures";

const searchUser = async (ctx: QueryCtx, query: string) => {
  const [byName, byUsername] = await Promise.all([
    ctx.db.query("usersExtended")
      .withSearchIndex("search_name", (q) => q.search("name", query))
      .take(10),
    ctx.db.query("usersExtended")
      .withSearchIndex("search_username", (q) => q.search("username", query))
      .take(10),
  ])

  const results = byUsername.concat(byName).reduce((acc, user) => {
    if (acc.find(u => u.userId === user.userId)) {
      return acc;
    }
    return [...acc, user];
  }, [] as typeof byName);

  return results.map((u) => ({
    _id: u.userId,
    name: u.name,
    username: u.username,
    image: u.imageUrl,
  }));
}

export const anon = publicQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    return searchUser(ctx, args.query);
  }
})

export const authed = authQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const results = await searchUser(ctx, args.query);
    return results.filter((u) => u._id !== ctx.userId);
  }
})