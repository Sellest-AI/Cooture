import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Text } from "../text";

type Props = {
  title?: string,
  style?: ViewStyle,
  children: React.ReactNode,
}

export const MenuGroup = ({ title, style, children }: Props) => {
  return (
    <View style={[{ marginBottom: 24 }, style]}>
      {title && <Text.Sm
        weight={500}
        color={Colors.neutral[400]}
        style={{ marginBottom: 4 }}
      >
        {title}
      </Text.Sm>}
      {children}
    </View>
  )
}