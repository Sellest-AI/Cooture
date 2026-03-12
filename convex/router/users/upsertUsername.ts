import { v } from "convex/values";
import { api } from "../../_generated/api";
import { authMutation } from "../../procedures";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const authed = authMutation({
  args: {
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const { available, sanitizedUsername } = await ctx.runQuery(api.router.users.checkUsername.anon, { username: args.username });

    if (ctx.user.username !== sanitizedUsername) {
      if (!available) throw new Error("Username not available");
    }

    const currentUser = await ctx.db.get(ctx.userId);
    if (!currentUser) throw new Error("User not found");
    if (!currentUser.name) await ctx.db.patch(ctx.userId, { name: args.displayName });

    const sanitizedDisplayName = args.displayName
      .trim()
      .replace(/\s+/g, ' ')           // collapse multiple spaces
      .slice(0, 50);

    const firstName = capitalize(sanitizedDisplayName.split(' ')[0]).trim();
    const lastName = capitalize(sanitizedDisplayName.split(' ').slice(1).join(' ')).trim();

    if (!ctx.user._idExtended) throw new Error("User extended not found");

    await ctx.db.patch(ctx.user._idExtended, {
      username: sanitizedUsername,
      name: sanitizedDisplayName,
      firstName,
      lastName,
    })
  }
})