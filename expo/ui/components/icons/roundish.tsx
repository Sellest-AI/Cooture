import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Use } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring } from '../motion';

type RoundishProps = {
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: ViewStyle;
  animate?: boolean;
};

export const Roundish = ({
  size = 86,
  color = 'rgb(237, 40, 40)',
  strokeColor = 'rgba(255, 255, 255, 0.16)',
  strokeWidth = 4,
  style,
  animate = false,
}: RoundishProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      // Rotate 72 degrees (20% of 360) with each tick, repeating infinitely
      const tick = (value: number) => withSpring(value, {
        damping: 8,
        stiffness: 80,
        mass: 0.8,
      })

      rotation.value = withRepeat(
        withSequence(
          tick(72),
          tick(144),
          tick(216),
          tick(288),
        ),
        -1, // Infinite repeat
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [animate, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transformOrigin: 'center center',
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          transformOrigin: 'center center',
          alignItems: 'center',
          ...style,
        },
      ]}
    >
      <Animated.View
        style={[
          animate && animatedStyle
        ]}
      >
        <Svg
          width={size}
          height={size}
          viewBox="0 0 86 86"
          fill="none"
        >
          <G>
            <Defs>
              <Path
                d="M 36.058 5.472 C 40.445 3.36 45.555 3.36 49.942 5.472 L 69.677 14.976 C 74.064 17.089 77.25 21.084 78.333 25.831 L 83.207 47.186 C 84.291 51.933 83.154 56.915 80.118 60.722 L 66.461 77.847 C 63.425 81.654 58.821 83.871 53.952 83.871 L 32.048 83.871 C 27.179 83.871 22.575 81.654 19.539 77.847 L 5.882 60.722 C 2.846 56.915 1.709 51.933 2.793 47.186 L 7.667 25.831 C 8.75 21.084 11.936 17.089 16.323 14.976 Z"
                id="a1000z"
              />
              <ClipPath id="a1001z">
                <Use href="#a1000z" />
              </ClipPath>
            </Defs>
            <Use
              href="#a1000z"
              fill={color}
              clipPath="url(#a1001z)"
              strokeWidth={strokeWidth}
              stroke={strokeColor}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};