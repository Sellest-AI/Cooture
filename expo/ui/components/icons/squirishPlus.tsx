import { Plus } from "lucide-react-native";
import { useRef } from "react";
import { Animated, Pressable, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Text } from '../text';
import { Squirish } from "./squirish";

type Props = {
  disabled?: boolean;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle
}

export const SquirishPlus = ({ disabled, size, onPress, style }: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const finalSize = size || 112;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        alignItems: 'center',
        ...style
      }}
    >
      <Animated.View
        style={{
          width: finalSize,
          height: finalSize,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Squirish
          style={{ position: 'absolute' }}
          color={Colors.blur.dark}
          strokeColor={Colors.blur.medium}
          size={finalSize}
        />
        <Plus
          size={32}
          color={Colors.foreground}
          style={{ zIndex: 1 }}
        />
      </Animated.View>
      <Text.Sm
        style={{ marginHorizontal: 'auto', marginTop: 6 }}
        color={Colors.foreground}
        weight={600}
      >
        Add new
      </Text.Sm>
    </Pressable>
  )
}