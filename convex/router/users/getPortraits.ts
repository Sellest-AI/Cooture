import { v } from "convex/values";
import { getPortraits } from "../../functions/users";
import { authQuery, internalQuery } from "../../procedures";

export const authed = authQuery({
  handler: async (ctx) => {
    const { userId } = ctx;
    return getPortraits(ctx, userId);
  }
})

export const _internal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return getPortraits(ctx, userId);
  }
})