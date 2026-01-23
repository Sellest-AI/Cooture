import { createContext, useContext } from "react";
import { Animated } from "react-native";

type ParallaxScrollContextType = {
  scrollY: Animated.Value;
  headerOffset: number;
} | null;

export const ParallaxScrollContext = createContext<ParallaxScrollContextType>(null);

export const useParallaxScroll = () => {
  const context = useContext(ParallaxScrollContext);
  if (!context) {
    throw new Error('useParallaxScroll must be used within a ParallaxScrollView');
  }
  return context;
};
