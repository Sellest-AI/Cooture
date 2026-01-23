import { ComponentProps, useRef } from "react";
import { Animated, Pressable, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Block } from "../block";
import { Roundish } from "../icons/roundish";
import { Image } from "../image";
import { Text } from "../text";

type ImageGenerationProps = {
  text?: string;
  /** Very useful in a carousel where the image is scaled down */
  textScale?: number;
  source: ComponentProps<typeof Image>['source'];
  loading?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
}

export const ImageGeneration = ({ text, textScale = 1, source, disabled, loading, style }: ImageGenerationProps) => {
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

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, width: '100%' }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Block
          variant="blur"
          style={{
            borderRadius: 24,
            aspectRatio: 3 / 4,
            width: '100%',
            pointerEvents: 'none',
            ...style
          }}
        >
          <Image
            source={source}
            blurRadius={loading ? 24 : 0}
            style={{
              opacity: loading ? 0.6 : 1,
              width: '100%',
              height: '100%',
            }}
          />
          {loading && <Roundish
            color={Colors.primary[500]}
            strokeColor={Colors.primary[700]}
            strokeWidth={2}
            animate={loading}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          />}
        </Block>
        {text && <Text.Base
          style={{
            flexShrink: 0,
            marginTop: 8,
            color: Colors.neutral[400],
            paddingHorizontal: 8,
            transform: [{ scale: textScale }],
            transformOrigin: 'left top',
          }}
        >
          {text}
        </Text.Base>}
      </Animated.View>
    </Pressable>
  )
}