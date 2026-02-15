import { ComponentProps, useRef, useState } from "react";
import { Animated, GestureResponderEvent, Pressable as NativePressable, ViewStyle } from "react-native";


type PressableProps = {
  disabled?: boolean;
  animated?: boolean;
  onDoublePress?: (e: GestureResponderEvent) => void;
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
} & ComponentProps<typeof NativePressable>;

export const Pressable = ({ disabled, onPress, children, animated = true, intensity = 0.98, onDoublePress, style, ...props }: PressableProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [innerDisabled, setInnerDisabled] = useState(false);

  const [lastPress, setLastPress] = useState<number | null>(null);

  const handlePressIn = () => {
    if (disabled || !animated) return;
    Animated.spring(scaleAnim, {
      toValue: intensity,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || !animated) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 18,
    }).start();
  };

  const {
    margin, marginTop, marginBottom, width, top,
    left, minHeight, height, position, bottom, right, zIndex, ...filteredStyle } = (style ?? {}) as ViewStyle;

  return (
    <NativePressable
      {...props}
      style={{
        flex: style?.flex,
        minHeight,
        width,
        height,
        aspectRatio: style?.aspectRatio,
        margin,
        marginTop,
        marginBottom,
        bottom,
        right,
        top,
        left,
        position,
        zIndex
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        if (disabled) return;

        if (!onDoublePress) {
          if (innerDisabled) return;
          setInnerDisabled(true);
          setTimeout(() => { setInnerDisabled(false) }, 300);
        }

        if (onPress) onPress(e);

        if (onDoublePress) {
          const now = new Date().getTime();
          if (lastPress && (now - lastPress) < 300) { onDoublePress(e); }
          setLastPress(now);
        }
      }}
    >
      <Animated.View style={[filteredStyle, { width, height }, {
        transform: [{ scale: scaleAnim }],
        aspectRatio: style?.aspectRatio,
      }]}>
        {children}
      </Animated.View>
    </NativePressable>
  )
}