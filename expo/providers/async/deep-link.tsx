import { useAccount } from "@/lib/convex/auth";
import { parse, useLinkingURL } from "expo-linking";
import { RelativePathString, router } from "expo-router";
import { useEffect, useRef } from "react";

export function DeepLinkProvider() {
  const url = useLinkingURL();
  const lastUrl = useRef<string | null>(null);
  const { isAuthenticating } = useAccount.Authenticated();

  useEffect(() => {
    if (isAuthenticating) return;
    if (!url || url === lastUrl.current) return;
    lastUrl.current = url;

    const { path, queryParams } = parse(url);

    // For App Links / Universal Links, we only need the path part
    // hostname is the domain (e.g., www.cooture.app), which we don't want in the route
    const fullPath = path ? `/${path}` : "/";

    setTimeout(() => {
      router.dismissAll();
      router.push({
        pathname: fullPath as RelativePathString,
        params: queryParams ?? undefined,
      });
    }, 200)

  }, [isAuthenticating, url]);

  return null;
}