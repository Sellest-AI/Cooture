import { authQuery } from "../../procedures";
import { getUserSubscription } from "../../functions/subscriptions";
import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

export const _internal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => getUserSubscription(ctx, userId)
})

export const authed = authQuery({
  args: {}, handler: async (ctx) => getUserSubscription(ctx, ctx.userId)
})