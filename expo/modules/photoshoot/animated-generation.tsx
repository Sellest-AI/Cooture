import { ReactNode, useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";

type AnimatedProps = {
  children: ReactNode;
  status: 'IDLE' | 'ACCEPTING' | 'REJECTING';
  onAnimationComplete?: () => void;
}
export const AnimatedGeneration = ({ children, status, onAnimationComplete }: AnimatedProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const transformAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'IDLE') return;
    Animated.parallel([
      Animated.timing(transformAnim, {
        toValue: status === 'ACCEPTING' ? -50 : 75,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: status === 'ACCEPTING' ? 1.05 : 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [onAnimationComplete, scaleAnim, opacityAnim, status, transformAnim]);

  return (
    <Animated.View
      style={{
        width: Platform.OS === 'web' ? '100%' : undefined,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { translateY: transformAnim }]
      }}>
      {children}
    </Animated.View>
  )
}