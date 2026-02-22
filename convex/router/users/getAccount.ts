import { v } from "convex/values";
import { getAccount, getUserPublic } from "../../functions/users";
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
    return getUserPublic(ctx, args.userId);
  }
})