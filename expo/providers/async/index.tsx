// const ThemeProvider = dynamic(() => import("./theme").then((d) => d.ThemeProvider), { ssr: false })

import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "./auth";
import { FontsProvider } from "./fonts";

SplashScreen.preventAutoHideAsync();

type Props = {
  children?: React.ReactNode
}

export const AsyncProviders = ({ children }: Props) => {
  const [loadedLeft, setLoadedLeft] = useState(2);

  useEffect(() => {
    if (loadedLeft <= 0) SplashScreen.hideAsync();
  }, [loadedLeft])

  return (
    <>
      {/* BLOCK RENDERING UNTIL ALL ASYNC TASKS ARE DONE */}
      {loadedLeft <= 0 ? children : null}
      <FontsProvider onComplete={() => setLoadedLeft((p) => p - 1)} />
      <AuthProvider onComplete={() => setLoadedLeft((p) => p - 1)} />
      {/* <ThemeProvider /> */}
    </>
  )
}