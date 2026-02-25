import { v } from "convex/values";
import { registerPushToken } from "../../functions/notifications";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => registerPushToken(ctx, {
    userId: ctx.userId,
    token: args.token,
  })
})