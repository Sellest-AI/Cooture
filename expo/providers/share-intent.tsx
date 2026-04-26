import { useAccount } from "@/lib/convex/auth";
import { router } from "expo-router";
import { ShareIntentProvider as ExpoShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import { ROUTES } from "routes";

function ShareIntentListener() {
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const { isAuthenticating } = useAccount.Authenticated();

  useEffect(() => {
    if (isAuthenticating) return;
    // If we receive a share intent (URL, text, or files), open the modal
    if (hasShareIntent && (shareIntent.webUrl || shareIntent.text || shareIntent.files?.length)) {
      setTimeout(() => { router.push(ROUTES.MODALS.IMPORT_ITEM); }, 500);
    }
  }, [hasShareIntent, isAuthenticating, shareIntent]);

  return null;
}

export function ShareIntentProvider({ children }: { children: React.ReactNode }) {
  return (
    <ExpoShareIntentProvider
      options={{
        debug: __DEV__,
        resetOnBackground: true,
      }}
    >
      <ShareIntentListener />
      {children}
    </ExpoShareIntentProvider>
  );
}
