import { useAuthToken, useAuthActions as useConvexAuthActions } from "@convex-dev/auth/react";
import { env } from "env";
import { useRouter } from "expo-router";
import { ROUTES } from "global";
import { useCallback } from "react";
import { api, useQuery } from "./client";

export const useAuthActions = () => {
  const router = useRouter();
  const convex = useConvexAuthActions();

  const signInGoogle = useCallback((route?: string) => convex.signIn("google", {
    redirectTo: `${env.PUBLIC_AUTH_URL}?redirect=${window.location.origin}/${route ?? ROUTES.HOME}`
      .replaceAll('//', '/'),
  }), [convex]);

  const signInEmail = useCallback((data: FormData) => {
    return convex.signIn("resend-otp", data);
  }, [convex]);

  const signOut = useCallback(() => {
    router.push(ROUTES.HOME);
    setTimeout(() => {
      convex.signOut();
      // posthog.reset();
      setTimeout(() => {
        window.localStorage.clear();
        window.location.reload();
      }, 500);
    }, 300)
  }, [convex, router]);

  return {
    signOut,
    signInGoogle,
    signInEmail,
  }
}

export const useAccount = () => {
  const token = useAuthToken();
  const { data: user } = useQuery(api.router.users.getAccount.authed, !!token ? undefined : 'skip');

  const isAuthenticated = !!token;
  const isAdmin = useIsAdmin();

  const isPremium = false;

  // Determine the account status
  const accountStatus = user?.accountStatus === "FLAGGED" && !isPremium ?
    "SUSPENDED" : user?.accountStatus ?? "INACTIVE";
  const isSuspended = accountStatus === "SUSPENDED";

  return {
    user,
    isAuthenticated,
    isPremium,
    isAdmin,
    isSuspended
  };
}

export const useIsAdmin = () => {
  const { data: user } = useQuery(api.router.users.getAccount.authed);
  const isAdmin = user?.role === 'ADMIN';
  return isAdmin;
}