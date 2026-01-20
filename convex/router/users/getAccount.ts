import { v } from "convex/values";
import { adminQuery, serverQuery, internalQuery, authQuery } from "../../procedures";
import { getAccount } from "../../functions/users";

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