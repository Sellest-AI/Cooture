import { v } from "convex/values";
import { env } from "../../../env";
import { adminMutation } from "../../../procedures";

export const admin = adminMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (!user.email) throw new Error("User email not found");

    return {
      email: user.email,
      password: env.BOT_DEFAULT_PASSWORD,
    }
  }
})