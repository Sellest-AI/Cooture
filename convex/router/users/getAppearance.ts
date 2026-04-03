import { v } from "convex/values";
import { getAppearance } from "../../functions/users";
import { authQuery, internalQuery } from "../../procedures";

export const authed = authQuery({
  handler: async (ctx) => {
    const { userId } = ctx;
    return getAppearance(ctx, userId);
  }
})

export const _internal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return getAppearance(ctx, userId);
  }
})