import { EyeOff } from "@ui/icons";
import { Image } from "@ui/image";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Props = {
  src?: string;
  style?: ViewStyle;
}
export const PostHiddenCard = ({ src, style }: Props) => {
  const { marginHorizontal, marginVertical, marginTop, marginBottom, ...restStyle } = style || {};

  return (
    <View style={{
      width: '100%',
      paddingHorizontal: marginHorizontal,
      paddingVertical: marginVertical,
      marginTop,
      marginBottom,
      flex: 1,
    }}>
      <View style={{
        width: '100%',
        flexDirection: 'column',
        backgroundColor: src ? 'transparent' : Colors.blur.dark,
        borderRadius: 16,
        ...restStyle,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
      >
        {src && <Image
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.2,
          }}
          blurRadius={20}
          contentFit="cover"
          source={src}
        />}
        <EyeOff size={24} color={Colors.neutral[400]} />
      </View>
    </View>
  )
} 