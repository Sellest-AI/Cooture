import { ComponentProps, ReactNode, useRef } from "react";
import { Animated, ScrollView, View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Image } from "./image";
import { LinearGradient } from "./linear-gradient";
import { ParallaxScrollContext } from "./parallax-scroll-view.context";
import { SafeAreaView } from "./safe-area-view";

type Props = {
  ref?: React.Ref<ScrollView>;
  headerSpace?: number;
  headerHeight?: number;
  headerContent: ReactNode;
  headerBackgroundImage?: ComponentProps<typeof Image>['source'];
  headerBackground?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
};

export const ParallaxScrollView = ({
  ref,
  headerHeight = 400,
  headerSpace = 80,
  headerContent,
  headerBackgroundImage,
  headerBackground,
  children,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: Props) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerOffset = headerHeight - headerSpace;

  return (
    <View style={{ flex: 1 }}>
      {/* Parallax Background Header */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          transform: [{ translateY: headerTranslateY }],
          opacity: headerOpacity,
          zIndex: 0,
          overflow: 'hidden',
        }}
        pointerEvents="none"
      >
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
            style={{
              width: '100%',
              height: '100%',
            }}
            contentFit="cover"
          />
        )}
        <LinearGradient
          colors={['transparent', Colors.background]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '50%'
          }}
        />
        <LinearGradient
          colors={[Colors.background, 'transparent']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '25%',
            opacity: 0.5
          }}
        />
      </Animated.View>

      {/* Interactive Header Content */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          transform: [{ translateY: headerTranslateY }],
          opacity: headerOpacity,
          zIndex: 1,
        }}
        pointerEvents="box-none"
      >
        <SafeAreaView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          pointerEvents="box-none"
        >
          {headerContent}
        </SafeAreaView>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={ref}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        contentContainerStyle={contentContainerStyle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View style={{ height: headerHeight - headerSpace, pointerEvents: 'none' }} />

        <ParallaxScrollContext.Provider value={{ scrollY, headerOffset }}>
          {/* Content with background */}
          <View style={{ zIndex: 1 }}>
            {children}
          </View>
        </ParallaxScrollContext.Provider >
      </Animated.ScrollView>
    </View >
  );
};
