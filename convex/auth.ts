import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { MutationCtx } from "./_generated/server";

const allowEmail = (email: string) => {
  if ((email.includes('+') || /\d{8,}/.test(email)))
    throw new Error("This email address is not permitted.");
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Apple({
      profile: ({ user, ...info }) => {
        const name = user ? `${user.name.firstName} ${user.name.lastName}` : null;
        const email = info.email ?? user?.email;
        if (email) { allowEmail(email); }
        return {
          id: info.sub,
          email: email ?? undefined,
          name: name ?? undefined,
          image: undefined,
        }
      }
    }),
    Google({
      profile: (info) => {
        const email = info.email;
        if (email) { allowEmail(email); }
        return {
          id: info.sub,
          email: email ?? undefined,
          name: info.name ?? undefined,
          image: info.picture ?? undefined,
        }
      }
    }),
    Password
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      const url = new URL(redirectTo);

      if (url.protocol === "http:" || url.protocol === "https:") {
        // Web
        return redirectTo;
      } else {
        // Mobile (scheme://)
        return redirectTo;
      }
    },
    async beforeSessionCreation(ctx: MutationCtx, { userId }) {
      const user = await ctx.db.get(userId);

      if (user?.email) { allowEmail(user.email); }

      const existing = await ctx.db.query('usersExtended')
        .withIndex('by_user_id', (q) => q.eq('userId', userId)).first();

      if (!existing) return;

      if (existing.accountStatus === "DELETED")
        throw new Error("This account has been deleted.");

      // Cancel pending account deletion if user signs in again
      if (existing.deleteFunctionId) {
        await ctx.scheduler.cancel(existing.deleteFunctionId);
        await ctx.db.patch(existing._id, { deleteFunctionId: undefined });
      }
    },
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId }) {
      // avoid duplicate
      const existing = await ctx.db.query('usersExtended')
        .withIndex('by_user_id', (q) => q.eq('userId', userId)).first();
      if (existing) return;

      const user = await ctx.db.get(userId);
      await ctx.scheduler.runAfter(1, internal.router.auth.postCreateOrUpdate.action, {
        userId: userId,
        email: user?.email,
        name: user?.name,
      })
    },
  }
});
