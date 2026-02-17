import { DimensionValue, ViewStyle } from "react-native";
import { Colors } from "theme";
import { MotiView } from "./motion";

type Props = {
  style?: ViewStyle;
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
}

export const Skeleton = ({ style, width, height, radius }: Props) => {
  const opacity = Number(style?.opacity ?? 1);

  return (
    <MotiView style={{
      backgroundColor: Colors.blur.dark,
      borderRadius: radius ?? ((Number(style?.height)) < 20 ? 4 : 16),
      width,
      height,
      ...style,
    }}
      from={{ opacity: 0 }}
      animate={{ opacity: [0.5 * opacity, 1 * opacity, 0.5 * opacity] }}
      transition={{ loop: true, duration: 500 }}
    />
  )
}