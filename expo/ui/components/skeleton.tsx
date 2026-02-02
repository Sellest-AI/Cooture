import { ViewStyle } from "react-native";
import { Colors } from "theme";
import { MotiView } from "./motion";

type Props = {
  style?: ViewStyle;
}

export const Skeleton = ({ style }: Props) => {
  return (
    <MotiView style={{
      backgroundColor: Colors.blur.dark,
      borderRadius: (Number(style?.height)) < 20 ? 4 : 16,
      ...style,
    }}
      from={{ opacity: 0 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ loop: true, duration: 500 }}
    />
  )
}