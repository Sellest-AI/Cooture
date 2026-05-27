// const ThemeProvider = dynamic(() => import("./theme").then((d) => d.ThemeProvider), { ssr: false })

import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { DeepLinkProvider } from "./deep-link";
import { FontsProvider } from "./fonts";
import { TrackingIOSProvider } from "./ios-tracking";
import { NativeUpdateProvider } from "./native-update";
import { NotificationsProvider } from "./notifications";
import { OTAUpdateProvider } from "./ota-update";

SplashScreen.preventAutoHideAsync();

type Props = {
  children?: React.ReactNode
}

export const AsyncProviders = ({ children }: Props) => {
  const [loadedLeft, setLoadedLeft] = useState(1);

  useEffect(() => {
    if (loadedLeft <= 0) SplashScreen.hideAsync();
  }, [loadedLeft])

  return (
    <>
      {/* BLOCK RENDERING UNTIL ALL ASYNC TASKS ARE DONE */}
      {loadedLeft <= 0 ? children : null}
      <FontsProvider onComplete={() => setLoadedLeft((p) => p - 1)} />
      <OTAUpdateProvider />
      <NativeUpdateProvider />
      <NotificationsProvider />
      <DeepLinkProvider />
      <TrackingIOSProvider />
      {/* <ThemeProvider /> */}
    </>
  )
}