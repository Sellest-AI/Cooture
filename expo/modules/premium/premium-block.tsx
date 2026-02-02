import { Block } from "@ui/block";
import { ArrowUpRight, Gem } from "@ui/icons";
import { Text } from "@ui/text";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Props = {
  style?: ViewStyle
}

export const PremiumBlock = ({ style }: Props) => {
  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 28,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <Block
        variant="primary"
        style={{
          width: 68,
          aspectRatio: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
        }}
      >
        <Gem size={28} color={Colors.primary[900]} />
      </Block>
      <View style={{ flex: 1, paddingHorizontal: 12, gap: 6 }}>
        <Text.Lg
          color={Colors.primary[500]}
          numberOfLines={1}
        >
          Unlock unlimited generations
        </Text.Lg>
        <View style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 28,
        }}>
          <Text.Sm
            color={Colors.primary[200]}
            numberOfLines={2}
            style={{ flex: 1, overflow: 'visible' }}
            textBreakStrategy="balanced"
          >
            Upgrade your plan and unlock more generations.
          </Text.Sm>
          <ArrowUpRight
            color={Colors.primary[200]}
            size={24}
          />
        </View>
      </View>
    </Block>
  )
}