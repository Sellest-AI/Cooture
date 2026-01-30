import { ComponentProps } from "react";
import { DimensionValue, View, ViewStyle } from "react-native";
import { Grid as GridNative } from "react-native-easy-grid";

export { Col, Row } from "react-native-easy-grid";

type GridProps = ComponentProps<typeof GridNative> & {
  style: ViewStyle & { height: DimensionValue };
}

export const Grid = ({ style, children, ...props }: GridProps) => {
  return (
    <View style={[{ height: style.height, minHeight: style.height }, style, { flex: 0 }]}>
      <GridNative style={[style, { flex: 0, marginTop: 0 }]} {...props}>
        {children}
      </GridNative>
    </View>
  )
}