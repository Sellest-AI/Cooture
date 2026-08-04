import { v } from "convex/values";
import { getAppearance } from "../../functions/users";
import { adminQuery, authQuery, internalQuery } from "../../procedures";

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

/**
 * Returns another user's height, gender, body size and portrait image ids from a
 * caller-supplied id, so it must be gated on the ADMIN role — `authQuery` here made
 * every user's appearance readable by any signed-in user.
 */
export const admin = adminQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return getAppearance(ctx, userId);
  }
})