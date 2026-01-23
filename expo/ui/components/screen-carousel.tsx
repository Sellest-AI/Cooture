import { ReactNode } from "react";
import { View } from "react-native";
import CarouselRNRC from "react-native-reanimated-carousel";
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "./motion";

type CarouselImageProps = {
  animationValue: SharedValue<number>,
  item: ReactNode,
  animate?: boolean,
}

const CarouselComponent = ({ animationValue, item, animate }: CarouselImageProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!animate) return {}

    const rotate = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [-2, 0, 2]
    );

    const translateY = interpolate(
      animationValue.value,
      [-1, -0.5, 0, 0.5, 1],
      [16, 8, 0, 8, 16]
    );

    return {
      transform: [
        { rotateZ: `${rotate}deg` },
        { translateY }
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          paddingHorizontal: 18,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        },
        animatedStyle
      ]}
    >
      {item}
    </Animated.View>
  )
}

type CarouselProps<T extends ReactNode> = {
  items: T[];
  itemWidth?: number;
  itemHeight?: number;
  itemsOffset?: number;
  scaleAnimation?: boolean;
}

export const Carousel = <T extends ReactNode>({ scaleAnimation, items, itemWidth, itemsOffset, itemHeight }: CarouselProps<T>) => {
  return (
    <View style={{
      width: '100%',
      overflow: 'visible',
      flex: 1,
    }}
    >
      <CarouselRNRC
        style={{ flex: 1, marginTop: -32, width: '100%', overflow: 'visible' }}
        data={items}
        mode="parallax"
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        modeConfig={{
          parallaxAdjacentItemScale: 0.75,
          parallaxScrollingOffset: itemsOffset ?? 80,
        }}
        renderItem={({ item, index, animationValue }) => {
          const Component = item;

          return <CarouselComponent
            key={index}
            animationValue={animationValue}
            animate={scaleAnimation}
            item={Component}
          />;
        }}
      />
    </View>
  )
}