import { useAuthToken, useAuthActions as useConvexAuthActions } from "@convex-dev/auth/react";
import { makeRedirectUri } from "expo-auth-session";
import { Href, router } from "expo-router";
import { openAuthSessionAsync } from "expo-web-browser";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { ROUTES } from "routes";
import { api, useQuery } from "./client";
import { convexAuthStorage } from "./storage";

export const useAuthActions = () => {
  const convex = useConvexAuthActions();

  const [isLoading, setIsLoading] = useState(false);

  const signInGoogle = useCallback(async (route?: Href) => {
    setIsLoading(true);
    const redirectTo = makeRedirectUri();
    const { redirect } = await convex.signIn("google", { redirectTo });

    if (Platform.OS === "web") { return; }

    const result = await openAuthSessionAsync(redirect!.toString(), redirectTo);
    if (result.type === "success") {
      const { url } = result;
      const code = new URL(url).searchParams.get("code")!;
      await convex.signIn("google", { code });
      router.replace(route || ROUTES.HOME);
    }

    setIsLoading(false);
  }, [convex]);

  const signInEmail = useCallback((data: FormData) => {
    return convex.signIn("resend-otp", data);
  }, [convex]);

  const signOut = useCallback(() => {
    router.push(ROUTES.HOME);
    setTimeout(() => {
      convex.signOut();
      // posthog.reset();
      setTimeout(() => {
        convexAuthStorage.clear();
        router.reload();
        // window.localStorage.clear();
        // window.location.reload();
      }, 500);
    }, 300)
  }, [convex]);

  return {
    isLoading,
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