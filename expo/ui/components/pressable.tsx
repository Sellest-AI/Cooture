import { ComponentProps, useRef, useState } from "react";
import { Animated, Pressable as NativePressable, ViewStyle } from "react-native";

type PressableProps = {
  disabled?: boolean;
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
} & ComponentProps<typeof NativePressable>;

export const Pressable = ({ disabled, onPress, children, intensity = 0.98, style, ...props }: PressableProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [innerDisabled, setInnerDisabled] = useState(false);

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

  const { margin, marginTop, ...filteredStyle } = (style ?? {}) as ViewStyle;

  return (
    <NativePressable
      {...props}
      style={{
        flex: 1,
        aspectRatio: style?.aspectRatio,
        margin,
        marginTop,
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        if (innerDisabled) return;
        setInnerDisabled(true);
        if (disabled) return;
        if (onPress) onPress(e);
        setTimeout(() => { setInnerDisabled(false) }, 300);
      }}
    >
      <Animated.View style={[filteredStyle, {
        transform: [{ scale: scaleAnim }],
        aspectRatio: style?.aspectRatio,
      }]}>
        {children}
      </Animated.View>
    </NativePressable>
  )
}