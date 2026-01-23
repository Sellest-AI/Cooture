import { View, ViewStyle } from 'react-native';
import Svg, { ClipPath, Defs, FeComposite, FeFlood, FeGaussianBlur, FeOffset, Filter, G, Mask, Path, Rect, Use } from 'react-native-svg';

type ExposishProps = {
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: ViewStyle;
};

export const Explozish = ({
  size = 86,
  color = 'rgb(237, 40, 40)',
  strokeColor = 'rgba(255, 255, 255, 0.16)',
  strokeWidth = 4,
  style,
}: ExposishProps) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        },
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
              d="M 41.19 5.143 C 41.911 3.612 44.089 3.612 44.81 5.143 L 50.978 18.255 C 51.446 19.25 52.629 19.68 53.627 19.219 L 66.781 13.14 C 68.317 12.43 69.986 13.83 69.554 15.467 L 65.851 29.476 C 65.57 30.539 66.2 31.629 67.26 31.917 L 81.244 35.715 C 82.878 36.159 83.256 38.304 81.873 39.28 L 70.031 47.632 C 69.133 48.265 68.914 49.505 69.542 50.408 L 77.813 62.306 C 78.779 63.696 77.689 65.582 76.003 65.441 L 61.563 64.227 C 60.468 64.135 59.504 64.944 59.404 66.039 L 58.092 80.47 C 57.939 82.155 55.891 82.9 54.691 81.708 L 44.409 71.496 C 43.629 70.722 42.371 70.722 41.591 71.496 L 31.309 81.708 C 30.109 82.9 28.061 82.155 27.908 80.47 L 26.596 66.039 C 26.496 64.944 25.532 64.135 24.437 64.227 L 9.997 65.441 C 8.311 65.582 7.221 63.696 8.187 62.306 L 16.458 50.408 C 17.086 49.505 16.867 48.265 15.969 47.632 L 4.127 39.28 C 2.744 38.304 3.122 36.159 4.756 35.715 L 18.74 31.917 C 19.8 31.629 20.43 30.539 20.149 29.476 L 16.446 15.467 C 16.014 13.83 17.683 12.43 19.219 13.14 L 32.373 19.219 C 33.371 19.68 34.554 19.25 35.022 18.255 Z"
              id="a1002z"
            />
            <ClipPath id="a1003z">
              <Use href="#a1002z" />
            </ClipPath>
            <Filter id="a1004z" filterUnits="objectBoundingBox" x="-34.0%" y="-35.7%" width="165.6%" height="169.0%">
              <FeOffset dx="0" dy="1" in="SourceAlpha" result="a1007z" />
              <FeGaussianBlur stdDeviation="4.5" in="a1007z" result="a1008z" />
              <FeFlood floodColor="rgba(67, 79, 23, 0.05)" result="a1009z" />
              <FeComposite in="a1009z" in2="a1008z" operator="in" result="a1005z" />
            </Filter>
          </Defs>
          <Mask id="a1006z" x="-34.0%" y="-35.7%" width="165.6%" height="169.0%">
            <Rect x="-34.0%" y="-35.7%" width="165.6%" height="169.0%" fill="white" />
            <Use href="#a1002z" fill="black" />
          </Mask>
          <G filter="url(#a1004z)" mask="url(#a1006z)">
            <Use
              strokeWidth={strokeWidth}
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="black"
              href="#a1002z"
              clipPath="url(#a1003z)"
            />
          </G>
          <Use
            href="#a1002z"
            fill={color}
            clipPath="url(#a1003z)"
            strokeWidth={strokeWidth}
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};
