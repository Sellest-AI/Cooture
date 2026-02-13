import { ComponentProps, ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Image } from "./image";
import { LinearGradient } from "./linear-gradient";
import { ParallaxScrollContext } from "./parallax-scroll-view.context";
import { SafeAreaView, useSafeAreaInsets } from "./safe-area-view";

type Props = {
  ref?: React.Ref<ScrollView>;
  /** Space between the header and the scrollable content */
  contentNegativeSpace?: number;
  /** Height of the header */
  headerContent: ReactNode;
  headerBackgroundImage?: ComponentProps<typeof Image>['source'];
  headerBackgroundImageStyle?: ComponentProps<typeof Image>['style'];
  headerBackgroundImagePosition?: ComponentProps<typeof Image>['contentPosition'];
  headerBackground?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  locked?: boolean;
  style?: ViewStyle;
  /** Scroll key to control scroll position */
  scrollKey?: string | number;
};

export const ParallaxScrollView = ({
  ref,
  scrollKey = undefined,
  contentNegativeSpace = 0,
  headerContent,
  headerBackgroundImageStyle,
  headerBackgroundImagePosition,
  headerBackgroundImage,
  headerBackground,
  children,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  locked = false,
  style,

}: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  useImperativeHandle(ref, () => scrollRef.current!, []);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: 'clamp',
  });

  // For content inside ScrollView: counteract natural scroll to create parallax
  const headerContentParallax = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, headerHeight / 2], // Positive to slow down natural scroll
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const { bottom } = useSafeAreaInsets();
  const headerHeightRuntime = headerHeight;
  const headerOffset = headerHeightRuntime - contentNegativeSpace;

  // Scroll to top when scrollKey changes
  useEffect(() => {
    if (scrollKey !== undefined) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollKey]);

  return (
    <View style={{ flex: 1, ...style }}>
      {/* Parallax Background Header */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeightRuntime,
          transform: [{ translateY: headerTranslateY }],
          zIndex: 0,
          overflow: 'hidden',
        }}
        pointerEvents="none"
      >
        <Animated.View style={{
          position: 'absolute',
          inset: 0,
          opacity: headerOpacity,
        }}>
          {headerBackground && <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
            {headerBackground}
          </View>}
          {headerBackgroundImage && (
            <Image
              source={headerBackgroundImage}
              style={[{
                width: '100%',
                height: '100%',
              }, headerBackgroundImageStyle]}
              contentPosition={headerBackgroundImagePosition}
              contentFit="cover"
            />
          )}
        </Animated.View>
        <Animated.View style={{
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
        </Animated.View>
        <LinearGradient
          colors={[Colors.background, 'transparent']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '30%',
            opacity: 0.8
          }}
        />
      </Animated.View>

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
        bounces={false}
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
            edges={{ bottom: 'off' }}
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
                Dimensions.get('screen').height - headerHeightRuntime + contentNegativeSpace - bottom
                : undefined,
            }}>
            {children}
          </View>
        </ParallaxScrollContext.Provider>
      </Animated.ScrollView>
    </View >
  );
};
