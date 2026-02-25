import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";

export const _internal_step_1 = internalQuery({
  args: { userId: v.id("users") },
  handler: async ({ db }, { userId }) => {
    const pushTokens = await db.query("pushTokens")
      .withIndex("by_user_id", q => q.eq("userId", userId)).collect();

    if (!pushTokens.length) return null;

    return pushTokens.map(token => token.token);
  }
});

export const _internal_step_2 = internalMutation({
  args: { token: v.string() },
  handler: async ({ db }, { token }) => {
    const tokens = await db.query("pushTokens")
      .withIndex("by_token", q => q.eq("token", token))
      .collect();

    await Promise.all(tokens.map(t => db.delete(t._id)));
  }
})