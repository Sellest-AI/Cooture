import { useFocusEffect } from "expo-router";
import { ComponentProps, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Animated, Dimensions, Platform, ScrollView, View, ViewStyle } from "react-native";
import Reanimated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Colors } from "theme";
import { Image } from "./image";
import { LinearGradient } from "./linear-gradient";
import { ParallaxScrollContext } from "./parallax-scroll-view.context";
import { SafeAreaView, useSafeAreaInsets } from "./safe-area-view";

const AnimatedImage = Platform.OS === 'ios' ? Reanimated.Image : Animated.createAnimatedComponent(Image);

type Props = {
  ref?: React.Ref<ScrollView>;
  /** Space between the header and the scrollable content */
  contentNegativeSpace?: number;
  /** Height of the header */
  headerContent: ReactNode;
  headerContentEdges?: ComponentProps<typeof SafeAreaView>['edges'];
  headerBackgroundImage?: ComponentProps<typeof Image>['source'];
  headerBackgroundImageStyle?: ComponentProps<typeof Image>['style'] & { blurRadius?: number };
  headerBackgroundImagePosition?: ComponentProps<typeof Image>['contentPosition'];
  headerBackground?: ReactNode;
  headerBackgroundGradient?: boolean;
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  locked?: boolean;
  style?: ViewStyle;
  /** Scroll key to control scroll position */
  scrollKey?: string | number;
  /** Allow negative scroll */
  enableExpandHeader?: boolean;
};

export const ParallaxScrollView = ({
  ref,
  scrollKey = undefined,
  contentNegativeSpace = 0,
  headerContent,
  headerContentEdges,
  headerBackgroundImageStyle,
  headerBackgroundImagePosition,
  headerBackgroundGradient = true,
  headerBackgroundImage,
  headerBackground,
  children,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  locked = false,
  enableExpandHeader = false,
  style,

}: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  useImperativeHandle(ref, () => scrollRef.current!, []);

  // Force reset layout to fix iOS black bar without flickering
  const [layoutToggle, setLayoutToggle] = useState(0);
  useFocusEffect(useCallback(() => {
    if (Platform.OS !== 'ios') return;
    requestAnimationFrame(() => {
      // Toggle a sub-pixel value to force native layout recalculation
      // without causing a visual 1px jump (flicker)
      setLayoutToggle((k) => k === 0 ? 0.01 : 0);
      requestAnimationFrame(() => setLayoutToggle((k) => k > 0 ? 0 : 0.01));
    });
  }, []));

  const scrollY = useRef(new Animated.Value(0)).current;

  // For content inside ScrollView: counteract natural scroll to create parallax
  const headerContentParallax = scrollY.interpolate({
    inputRange: [-headerHeight, 0, headerHeight],
    outputRange: [-headerHeight * 1.2, 0, headerHeight / 2], // Positive to slow down natural scroll
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [-headerHeight / 4, 0, headerHeight / 1.3, headerHeight],
    outputRange: [0, 1, 0.05, 0],
    extrapolate: 'clamp',
  });

  const backgroundImageOpacity = Number((headerBackgroundImageStyle as { opacity?: number })?.opacity) || 1;
  const headerBackgroundImageOpacity = scrollY.interpolate({
    inputRange: [-headerHeight / 4, 0, headerHeight / 1.3, headerHeight],
    outputRange: [1.1, backgroundImageOpacity, 0.05, 0],
    extrapolate: 'clamp',
  });

  const headerBackgroundScale = scrollY.interpolate({
    inputRange: [-headerHeight, 0, headerHeight / 2.5],
    outputRange: [1.1, 1, 1.02],
    extrapolate: 'clamp',
  });

  const scrollYReanimated = useSharedValue(0);
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      scrollYReanimated.value = value;
    });
    return () => scrollY.removeListener(listener);
  }, [scrollY, scrollYReanimated]);
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollYReanimated.value,
      [-headerHeight, 0],
      [headerHeight * 2, headerHeight],
      'clamp'
    ),
    transform: [{
      translateY: interpolate(
        scrollYReanimated.value,
        [0, headerHeight],
        [0, -headerHeight / 2],
        'clamp'
      )
    }]
  }));

  const { bottom: _bottom } = useSafeAreaInsets();
  const headerOffset = headerHeight - contentNegativeSpace;
  const bottom = Platform.OS === 'android' ? _bottom : 0;

  // Scroll to top when scrollKey changes
  useEffect(() => {
    if (scrollKey !== undefined) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollKey]);

  return (
    <View style={{ flex: 1, ...style }}>
      {/* Parallax Background Header */}
      <Reanimated.View
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: 0,
          overflow: 'hidden',
          paddingTop: layoutToggle,
        }, headerAnimatedStyle]}
        pointerEvents="none"
      >
        <Animated.View style={[{
          position: 'absolute',
          inset: 0,
          opacity: headerBackgroundImageOpacity,
          transform: [{ scale: headerBackgroundScale }],
        }]}>
          {headerBackground && <View style={{
            position: 'absolute',
            inset: 0,
          }}>
            {headerBackground}
          </View>}
          {headerBackgroundImage && (
            <AnimatedImage
              source={{
                uri: headerBackgroundImage.toString(),
                cache: 'force-cache'
              }}
              style={[{
                position: 'absolute',
                width: '100%',
                height: '100%',
                paddingTop: layoutToggle,
              },
                headerBackgroundImageStyle,
              { opacity: 1 }
              ]}
              blurRadius={headerBackgroundImageStyle?.blurRadius ?? 0}
              // DISABLED: reanimated wraps react native component and not expo image
              // Expo image causes black bar on ios
              contentPosition={headerBackgroundImagePosition}
              contentFit="cover"
            />
          )}
        </Animated.View>
        {headerBackgroundGradient && <Animated.View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -1,
          height: '50%',
        }}>
          <LinearGradient
            colors={['transparent', Colors.background]}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </Animated.View>}
        {headerBackgroundGradient && <LinearGradient
          colors={[Colors.background, 'transparent']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '30%',
            opacity: 0.8
          }}
        />}
      </Reanimated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={contentContainerStyle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        bounces={enableExpandHeader}
        overScrollMode={enableExpandHeader ? 'always' : 'never'}
        nestedScrollEnabled={true}
      >
        {/* Interactive Header Content */}
        <Animated.View
          onLayout={(layout) => setHeaderHeight(layout.nativeEvent.layout.height)}
          style={{
            position: 'relative',
            transform: [{ translateY: headerContentParallax }],
            opacity: headerOpacity,
            zIndex: 1,
          }}
          pointerEvents="box-none"
        >
          <SafeAreaView
            pointerEvents="box-none"
            edges={{ bottom: 'off', ...headerContentEdges }}
          >
            {headerContent}
          </SafeAreaView>
        </Animated.View>

        <ParallaxScrollContext.Provider value={{ scrollY, headerOffset }}>
          {/* Content with background */}
          <View
            key={locked ? 'locked' : 'unlocked'}
            style={{
              zIndex: 1,
              pointerEvents: 'auto',
              flex: 1,
              marginTop: -contentNegativeSpace,
              height: locked ?
                Dimensions.get('screen').height - headerHeight + contentNegativeSpace - bottom
                : undefined,
            }}>
            <View style={{
              pointerEvents: 'none',
              position: 'absolute',
              left: 0,
              right: 0,
              top: headerBackgroundGradient ? 0 : -32,
              height: headerHeight,
            }}
            >
              <LinearGradient
                colors={['transparent', Colors.background]}
                style={{
                  height: 132,
                }}
              />
              <View style={{ flex: 1, backgroundColor: Colors.background }} />
            </View>
            {children}
          </View>
        </ParallaxScrollContext.Provider>
      </Animated.ScrollView>
    </View >
  );
};
