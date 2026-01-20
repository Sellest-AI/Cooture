import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";
import Google from "@auth/core/providers/google";
import { internal } from "./_generated/api";
import { env } from "./env";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
  ],
  callbacks: {
    async redirect(params) {
      const { redirectTo } = params;
      const url = new URL(redirectTo);
      // USE THE FOLLOWING FOR DEPLOYED SITES (HTTPS CONNECTION)
      const redirectOrigin = new URL(env.FRONTEND_SITE_URL);
      // USE THE FOLLOWING FOR LOCAL TESTING (LOCALHOST CONNECTION)
      // const redirectOrigin = new URL("http://localhost:3000");
      const redirectUrl = new URL(url.toString().split("?redirect=")[1]);
      const trackingUrl = new URL(redirectOrigin.origin + "/tracking/device?redirect=" + redirectUrl);
      return trackingUrl.toString();
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
