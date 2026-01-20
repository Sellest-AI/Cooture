import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const FontsProvider = () => {
  const [fontsLoaded] = useFonts({
    'Murays-Regular': require('assets/fonts/Murays-Regular.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) { SplashScreen.hideAsync(); }
  }, [fontsLoaded]);

  return null;
}