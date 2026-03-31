import { ComponentProps, useEffect, useRef, useState } from "react";
import { Animated, Pressable, View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Explozish, Loader, Plus } from "../icons";
import { Image } from '../image';
import { Text } from "../text";

type Style = ViewStyle & { subtitleColor?: string };

type Props = {
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  style?: Style;
  selected?: boolean;
  source?: ComponentProps<typeof Image>['source'];
  contentFit?: ComponentProps<typeof Image>['contentFit'];
  onPress?: ComponentProps<typeof Pressable>['onPress'];
  backgroundColor?: string;
}

export const Collection = ({ title, subtitle, disabled, selected, source, contentFit, style, backgroundColor, onPress }: Props) => {
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(7)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.99,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

    Animated.spring(rotate, {
      toValue: selected ? 5 : 9,
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

    Animated.spring(rotate, {
      toValue: selected ? 3 : 7,
      useNativeDriver: true,
      speed: 30,
      bounciness: 15,
    }).start();
  };

  useEffect(() => {
    Animated.spring(rotate, {
      toValue: selected ? 3 : 7,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [rotate, selected])

  const noSource = !source;
  const borderColor = (selected || noSource) ? Colors.primary[500] : Colors.blur.light;
  const _backgroundColor = (selected || noSource) ? Colors.primary[500] : (contentFit === 'contain' ? (backgroundColor ?? Colors.neutral[50]) : Colors.blur.dark);
  const showText = title || subtitle;

  const { padding, paddingHorizontal, paddingVertical,
    paddingLeft, paddingRight, ...rest } = style || {};

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        setLoading(true);
        requestAnimationFrame(() => onPress?.(e));
        setTimeout(() => setLoading(false), 200);
      }}
      style={{
        flex: 1,
        width: style?.width,
        padding,
        paddingHorizontal,
        paddingVertical,
        paddingLeft,
        paddingRight,
      }}
    >
      <Animated.View
        style={{
          ...rest,
          aspectRatio: 4 / 5,
          // backgroundColor: 'red',
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Animated.View
          style={{
            width: '95%',
            height: '95%',
            position: 'absolute',
            transform: [{
              rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              })
            }, { scale: -1 }],
            top: "3.5%",
            left: "2.5%",
            backgroundColor: _backgroundColor,
            borderRadius: 12,
            overflow: 'hidden',
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderColor: borderColor,
            padding: contentFit === 'contain' ? 16 : undefined,
            opacity: contentFit === 'contain' ? 0.8 : 1,
          }}
        >
          {source && <Image
            source={source}
            contentFit={contentFit}
            style={{
              opacity: 0.2,
              width: '100%',
              height: '100%',
            }}
          />}
        </Animated.View>
        <Animated.View
          style={{
            width: '95%',
            height: '95%',
            position: 'absolute',
            transform: [{
              rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ['-0deg', '-360deg']
              })
            }, { scale: -1 }],
            top: "2%",
            left: "2.5%",
            backgroundColor: _backgroundColor,
            borderRadius: 12,
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderColor: borderColor,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            shadowOpacity: 1,
            padding: contentFit === 'contain' ? 16 : undefined,
            opacity: contentFit === 'contain' ? 0.9 : 1,
          }}
        >
          <View style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
            {source && <Image
              source={source}
              contentFit={contentFit}
              style={{
                opacity: 0.4,
                width: '100%',
                height: '100%',
              }}
            />}
          </View>
        </Animated.View>
        <Animated.View
          style={{
            borderRadius: 12,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor: borderColor,
            backgroundColor: _backgroundColor,
            position: 'absolute',
            top: "3%",
            left: "2.5%",
            width: '95%',
            height: '95%',
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            shadowOpacity: 1,
            padding: contentFit === 'contain' ? 16 : undefined,
          }}
        >
          <View style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
            {source && <Image
              source={source}
              contentFit={contentFit}
              style={{
                width: '100%',
                height: '100%',
                opacity: selected ? 0.7 : 1,
              }}
            />}
            {!source && <View
              style={{
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <Explozish
                color={Colors.primary[700]}
                strokeColor={Colors.blur.light}
                strokeWidth={1}
                size={86}
              />
              <Plus
                style={{
                  position: 'absolute'
                }}
                color={Colors.primary[500]}
                size={30}
              />
            </View>}
          </View>
        </Animated.View>
      </Animated.View>
      {showText && <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: selected ? 4 : 0,
          backgroundColor: selected ? Colors.primary[500] : 'transparent',
          borderRadius: selected ? 99 : 0,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 12,
          maxWidth: '100%',
        }}
      >
        {(loading && !selected) ? <Loader color={Colors.foreground} size={14} /> : <>
          {title && <Text.Sm
            numberOfLines={1}
            style={{
              maxWidth: '100%',
              width: '100%',
              fontWeight: 700,
              color: selected ? Colors.primary[900] : Colors.neutral[50],
            }}
          >
            {title}
          </Text.Sm>}
          {subtitle && <Text.Sm
            numberOfLines={1}
            style={{
              maxWidth: '100%',
              fontWeight: 700,
              color: selected ? Colors.primary[900] : style?.subtitleColor || Colors.neutral[400],
              opacity: selected ? 0.5 : 1,
              marginTop: 0
            }}
          >
            {subtitle}
          </Text.Sm>}
        </>}
      </View>}
    </Pressable>
  )
}