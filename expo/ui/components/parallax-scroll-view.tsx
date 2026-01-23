import { ComponentProps, ReactNode, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { LinearGradient } from "./linear-gradient";
import { ParallaxScrollContext } from "./parallax-scroll-view.context";
import { SafeAreaView } from "./safe-area-view";

type Props = {
  headerSpace?: number;
  headerHeight?: number;
  headerContent: ReactNode;
  headerBackgroundImage?: ComponentProps<typeof Animated.Image>['source'];
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
};

export const ParallaxScrollView = ({
  headerHeight = 400,
  headerSpace = 80,
  headerContent,
  headerBackgroundImage,
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
        {headerBackgroundImage && (
          <Animated.Image
            source={headerBackgroundImage}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
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
          zIndex: 10,
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
