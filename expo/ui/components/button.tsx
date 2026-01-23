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
} & ComponentProps<typeof Block> & ComponentProps<typeof Pressable>;

export const Button = ({ startIcon, endIcon, children, disabled, variant, href, ...props }: Props) => {
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

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        if (href) push(href);
      }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Block variant={variant} {...props}>
          <View
            style={{
              height: 56,
              position: 'relative',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: -2,
              paddingHorizontal: 24,
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