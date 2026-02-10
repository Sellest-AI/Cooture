import { v } from "convex/values";
import { getAccount } from "../../functions/users";
import { adminQuery, authQuery, internalQuery, publicQuery, serverQuery } from "../../procedures";

export const authed = authQuery({
  handler: async (ctx) => ctx.user
});

export const admin = adminQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await getAccount(ctx, args.userId);
    return user;
  }
})

export const server = serverQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await getAccount(ctx, args.userId);
    return user;
  }
})

export const _internal = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await getAccount(ctx, args.userId);
    return user;
  }
})


export const anon = publicQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      image: user.image,
    }
  }
})