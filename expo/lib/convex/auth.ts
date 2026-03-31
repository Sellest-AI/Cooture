import { useAuthToken, useAuthActions as useConvexAuthActions } from "@convex-dev/auth/react";
import { env } from "env";
import { makeRedirectUri } from "expo-auth-session";
import { Href, router } from "expo-router";
import { reloadAsync } from "expo-updates";
import { openAuthSessionAsync } from "expo-web-browser";
import { atom, useAtom } from "jotai";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { ROUTES } from "routes";
import { api, useMutation, useQueryCached } from "./client";
import { convexAuthStorage } from "./storage";

export const useAuthActions = () => {
  const convex = useConvexAuthActions();
  const { mutate: getTestAccount } = useMutation(api.router.auth.getTestAccount.anon);

  const { setAuthenticating } = useAuthenticated();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (provider: "apple" | "google", route?: Href) => {
    setIsLoading(true);
    const redirectTo = makeRedirectUri();
    const { redirect } = await convex.signIn(provider, { redirectTo });

    if (Platform.OS === "web") { return; }

    setAuthenticating(true);

    const result = await openAuthSessionAsync(redirect!.toString(), redirectTo);
    if (result.type === "success") {
      const { url } = result;
      const code = new URL(url).searchParams.get("code")!;
      await convex.signIn(provider, { code });

      if (route) setTimeout(() => router.dismissTo(route), 500);

      // Don't auto redirect, the router will do it on its own
      // router.replace(route || ROUTES.TABS.DISCOVER);
    }
    setIsLoading(false);
    return result.type === "success";
  }, [convex, setAuthenticating]);

  const signInGoogle = useCallback(async (route?: Href) => signIn("google", route), [signIn]);
  const signInApple = useCallback(async (route?: Href) => signIn("apple", route), [signIn]);

  const signInTester = useCallback(async () => {
    if (env.PUBLIC_NODE_ENV === 'production') return;
    const account = await getTestAccount();
    convex.signIn("password", { email: account.email, password: account.password, flow: "signIn" })
  }, [convex, getTestAccount])

  const signInEmail = useCallback((data: FormData) => {
    return convex.signIn("resend-otp", data);
  }, [convex]);

  const signOut = useCallback(() => {
    setAuthenticating(true);
    router.push(ROUTES.AUTH);
    setTimeout(() => {
      convex.signOut();
      // posthog.reset();
      setTimeout(async () => {
        convexAuthStorage.clear();
        try {
          await reloadAsync();
        } catch { }
        // window.localStorage.clear();
        // window.location.reload();
      }, 500);
    }, 300)
  }, [convex, setAuthenticating]);

  return {
    isLoading,
    signOut,
    signInGoogle,
    signInApple,
    signInEmail,
    signInTester
  }
}

export const useAccount = () => {
  const token = useAuthToken();
  const { data: user } = useQueryCached(api.router.users.getAccount.authed, !!token ? undefined : 'skip');

  const isAuthenticated = !!token;

  const isPremium = !!user?.plan;
  const userId = user?._id;

  // Determine the account status
  const accountStatus = user?.accountStatus === "FLAGGED" && !isPremium ?
    "SUSPENDED" : user?.accountStatus ?? "INACTIVE";
  const isSuspended = accountStatus === "SUSPENDED";

  const isInWaitlist = user?.accountStatus === "WAITLIST";

  return {
    user,
    userId,
    isAuthenticated,
    isPremium,
    isSuspended,
    isInWaitlist
  };
}

export const useIsAdmin = () => {
  const token = useAuthToken();
  const { data: user } = useQueryCached(api.router.users.getAccount.authed, !!token ? undefined : 'skip');
  const isAdmin = user?.role === 'ADMIN';
  return { isAdmin };
}

const useWallet = () => {
  const token = useAuthToken();
  const { data: wallet } = useQueryCached(api.router.credits.getUserWallet.authed, !!token ? undefined : 'skip');
  return { wallet };
}

const authenticatingAtom = atom(false);
const useAuthenticated = () => {
  const [isAuthenticating, _setAuthenticating] = useAtom(authenticatingAtom);
  const setAuthenticating = (value: boolean) => {
    if (value) { setTimeout(() => _setAuthenticating(false), 5000); }
    _setAuthenticating(value);
  }
  return {
    isAuthenticating,
    setAuthenticating
  }
}

useAccount.Admin = useIsAdmin;
useAccount.Wallet = useWallet;
useAccount.Authenticated = useAuthenticated;