import { useFonts } from "expo-font";
import { useEffect } from "react";

type Props = {
  onComplete?: () => void;
}

export const FontsProvider = ({ onComplete }: Props) => {
  const [fontsLoaded] = useFonts({
    'Murays': require('assets/fonts/Murays-Regular.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) { onComplete?.(); }
  }, [fontsLoaded, onComplete]);

  return null;
}