import { Id } from "../../_generated/dataModel";
import { MutationCtx } from "../../procedures";

type Args = {
  userId: Id<'users'>,
  token: string,
}

export const registerPushToken = async (ctx: MutationCtx, args: Args) => {
  const existing = await ctx.db.query("pushTokens")
    .withIndex("by_token", q => q.eq("token", args.token))
    .first();

  if (!existing) {
    return ctx.db.insert("pushTokens", { userId: args.userId, token: args.token });
  }

  return existing._id;
}