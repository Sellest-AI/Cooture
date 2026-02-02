import { ReactNode, useState } from "react";
import { Animated, LayoutChangeEvent, ViewStyle } from "react-native";
import { useParallaxScroll } from "./parallax-scroll-view.context";

type Props = {
  children: ReactNode;
  topOffset?: number;
  style?: ViewStyle;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export const StickyView = ({
  onLayout,
  children,
  topOffset = 0,
  style,
}: Props) => {
  const { scrollY, headerOffset } = useParallaxScroll();
  const [layoutY, setLayoutY] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    setLayoutY(y);
  };

  // Account for the header offset from ParallaxScrollView
  const absoluteY = headerOffset + layoutY;
  const stickyThreshold = Math.max(0, absoluteY - topOffset);

  const translateY = scrollY.interpolate({
    inputRange: [stickyThreshold, stickyThreshold + 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
    extrapolateRight: 'extend',

  });

  return (
    <Animated.View
      onLayout={(e) => { handleLayout(e); onLayout?.(e) }}
      style={[
        style,
        {
          transform: [{ translateY }],
          zIndex: 10,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
