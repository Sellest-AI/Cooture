import { parse, useLinkingURL } from "expo-linking";
import { RelativePathString, router } from "expo-router";
import { useEffect, useRef } from "react";

export function DeepLinkProvider() {
  const url = useLinkingURL();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!url || url === lastUrl.current) return;
    lastUrl.current = url;

    const { hostname, path, queryParams } = parse(url);

    const fullPath = hostname
      ? `/${hostname}${path ? `/${path}` : ""}`
      : `/${path}`;

    setTimeout(() => {
      router.dismissAll();
      router.push({
        pathname: fullPath as RelativePathString,
        params: queryParams ?? undefined,
      });
    }, 200)

  }, [url]);

  return null;
}