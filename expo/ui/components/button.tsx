import { useRouter } from 'expo-router';
import { ComponentProps, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Pressable, View, ViewStyle } from 'react-native';
import { Block, getBlockColors } from './block';
import { Loader } from './icons';
import { Text } from './text';

export const BUTTON_HEIGHT = 56;

type Props = {
  children?: React.ReactNode;
  startContent?: React.ReactNode;
  startIcon?: React.ComponentType<{ size?: number, color?: string, style?: ViewStyle }> | false;
  endIcon?: React.ComponentType<{ size?: number, color?: string, style?: ViewStyle }> | false;
  disabled?: boolean;
  href?: Parameters<ReturnType<typeof useRouter>['push']>[0];
  size?: "rounded",
  align?: "center" | "left" | "right" | "stretch";
  isLoading?: boolean;
} & ComponentProps<typeof Block> & Omit<ComponentProps<typeof Pressable>, 'style'>;

export const Button = ({ startIcon, startContent, endIcon, children, disabled, variant, href, size, style, isLoading: _isLoading, align, onPress, onLongPress, ...props }: Props) => {
  const [innerLoading, setInnerLoading] = useState(false);
  const isLoading = _isLoading || innerLoading;

  const StartIcon = isLoading ? Loader : startIcon;
  const EndIcon = endIcon;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { push } = useRouter();

  const runtimeDisabled = disabled || isLoading;

  const handlePressIn = () => {
    if (runtimeDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (runtimeDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 18,
    }).start();
  };

  const colors = getBlockColors(variant, runtimeDisabled);
  const isRounded = size === "rounded";
  const defaultAlign = align || (isRounded ? "center" : "stretch");

  const onPressWrapper = async (e: GestureResponderEvent, fnc?: (((event: GestureResponderEvent) => void | Promise<void>) | null)) => {
    if (runtimeDisabled) return;
    const timer = setTimeout(() => { setInnerLoading(true); }, 100);
    try {
      await fnc?.(e);
      if (href) push(href);
    } catch { }
    if (timer) clearTimeout(timer);
    setInnerLoading(false);
  }

  return (
    <Pressable
      {...props}
      style={{
        width: style?.width,
        flex: style?.flex,
        borderRadius: isRounded ? 99 : undefined,
        alignSelf: defaultAlign === "stretch" ? 'stretch' :
          defaultAlign === "center" ? 'center' :
            defaultAlign === "left" ? 'flex-start' :
              defaultAlign === "right" ? 'flex-end' : undefined,
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => onPressWrapper(e, onPress)}
      onLongPress={(e) => onPressWrapper(e, onLongPress)}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Block
          disabled={runtimeDisabled}
          variant={variant}
          {...props}
          style={{
            borderRadius: isRounded ? 99 : 18,
            ...style,
            flex: undefined,
          }}
        >
          <View
            style={{
              height: isRounded ? undefined : (style?.height ?? 56),
              position: 'relative',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: -2,
              paddingHorizontal: isRounded ? undefined : 24,
              padding: isRounded ? 12 : 0,
              opacity: runtimeDisabled ? 0.4 : 1,
            }}
          >
            {(startContent && !isLoading) && startContent}
            {StartIcon && <StartIcon
              size={20}
              color={colors.textColor}
            />}
            {typeof children === 'string' ? (
              <Text.Base
                style={{
                  color: colors.textColor,
                  fontWeight: 600,
                }}
              >
                {children}
              </Text.Base>
            ) : (children)}
            {EndIcon && <EndIcon
              size={20}
              color={colors.textColor}
            />}
          </View>
        </Block>
      </Animated.View>
    </Pressable>
  )
}