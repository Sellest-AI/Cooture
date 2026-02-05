import { useFonts } from "expo-font";
import { useEffect } from "react";

type Props = {
  onComplete?: () => void;
}

export const FontsProvider = ({ onComplete }: Props) => {
  const [fontsLoaded, fontError] = useFonts({
    'Murays': require('assets/fonts/Murays-Regular.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      onComplete?.();
    } else if (fontError) {
      console.error('Font loading error:', fontError);
      // Still call onComplete to prevent splash screen from hanging
      onComplete?.();
    }
  }, [fontsLoaded, fontError, onComplete]);

  return null;
}