import { useRouter } from 'expo-router';
import { ComponentProps, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Block, getBlockColors } from './block';
import { Text } from './text';

type Props = {
  children?: React.ReactNode;
  startIcon?: React.ComponentType<{ size?: number, color?: string }>;
  endIcon?: React.ComponentType<{ size?: number, color?: string }>;
  disabled?: boolean;
  href?: Parameters<ReturnType<typeof useRouter>['push']>[0];
  size?: "rounded",
  align?: "center" | "left" | "right" | "stretch";
} & ComponentProps<typeof Block> & Omit<ComponentProps<typeof Pressable>, 'style'>;

export const Button = ({ startIcon, endIcon, children, disabled, variant, href, size, style, align, onPress, ...props }: Props) => {
  const StartIcon = startIcon;
  const EndIcon = endIcon;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { push } = useRouter();

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

  const colors = getBlockColors(variant);
  const isRounded = size === "rounded";
  const defaultAlign = align || (isRounded ? "center" : "stretch");

  return (
    <Pressable
      {...props}
      style={{
        borderRadius: isRounded ? 99 : undefined,
        alignSelf: defaultAlign === "stretch" ? 'stretch' :
          defaultAlign === "center" ? 'center' :
            defaultAlign === "left" ? 'flex-start' :
              defaultAlign === "right" ? 'flex-end' : undefined,
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        if (onPress) onPress(e);
        if (href) push(href);
      }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Block
          variant={variant}
          {...props}
          style={{
            borderRadius: isRounded ? 99 : 18,
            ...style,
          }}
        >
          <View
            style={{
              height: isRounded ? undefined : 56,
              position: 'relative',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: -2,
              paddingHorizontal: isRounded ? undefined : 24,
              padding: isRounded ? 12 : 0,
            }}
          >
            {StartIcon && <StartIcon size={20} color={colors.textColor} />}
            {typeof children === 'string' ? (
              <Text.Base
                style={{
                  color: colors.textColor,
                  fontWeight: 600
                }}
              >
                {children}
              </Text.Base>
            ) : (children)}
            {EndIcon && <EndIcon size={20} color={colors.textColor} />}
          </View>
        </Block>
      </Animated.View>
    </Pressable>
  )
}