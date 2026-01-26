import { ComponentProps, useRef } from "react";
import { Animated, Pressable as NativePressable } from "react-native";

type PressableProps = {
  disabled?: boolean;
  children: React.ReactNode;
  intensity?: number;
} & ComponentProps<typeof NativePressable>;

export const Pressable = ({ disabled, onPress, children, intensity = 0.98, ...props }: PressableProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: intensity,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 18,
    }).start();
  };

  return (
    <NativePressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        if (disabled) return;
        if (onPress) onPress(e);
      }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </NativePressable>
  )
}