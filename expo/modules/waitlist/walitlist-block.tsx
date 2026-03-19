import { useRouter } from "@/hooks";
import { Block } from "@ui/block";
import { ArrowUpRight, Users } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Props = {
  style?: ViewStyle
}

export const WaitlistBlock = ({ style }: Props) => {
  const { push } = useRouter();
  return (
    <Pressable onPress={() => push("/waitlist-codes")}>
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
          <Users
            size={28}
          />
        </Block>
        <View style={{ flex: 1, paddingHorizontal: 12, gap: 6 }}>
          <Text.Lg
            color={Colors.primary[500]}
            numberOfLines={1}
          >
            Invite your friends
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
              Share your invite code and get early access for your friends when they sign up.
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