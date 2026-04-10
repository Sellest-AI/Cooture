import { useRouter } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { Block } from "@ui/block";
import { ArrowUpRight, Credits } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Props = {
  style?: ViewStyle
}

export const PremiumBlock = ({ style }: Props) => {
  const { isPremium } = useAccount();
  const { push } = useRouter();

  if (isPremium) return null;

  return (
    <Pressable onPress={() => push("/upgrade")}>
      <Block
        variant="blur"
        style={{
          borderRadius: 28,
          paddingLeft: 8,
          paddingRight: 4,
          paddingVertical: 8,
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
          {/* <Text.H3>💎</Text.H3> */}
          <Credits
            size={32}
            blurRadius={10}
            style={{
              position: 'absolute',
              opacity: 0.2,
            }}
          // color={Colors.primary[900]}
          // weight="duotone"
          // duotoneColor={Colors.primary[700]}
          />
          <Credits
            size={28}
          // color={Colors.primary[900]}
          // weight="duotone"
          // duotoneColor={Colors.primary[700]}
          />
        </Block>
        <View style={{ flex: 1, paddingHorizontal: 12, gap: 6 }}>
          <Text.Lg
            color={Colors.primary[500]}
            numberOfLines={1}
          >
            Unlock Cooture Max
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
              Exclusive features, free credits and more every week.
            </Text.Sm>
            <ArrowUpRight
              color={Colors.primary[200]}
              size={24}
            />
          </View>
        </View>
      </Block>
    </Pressable>
  )
}