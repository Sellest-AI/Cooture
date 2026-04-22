import { useRouter } from "@/hooks";
import { Block } from "@ui/block";
import { ArrowUpRight, Users } from "@ui/icons";
import { LinearGradient } from "@ui/linear-gradient";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { Platform, View, ViewStyle } from "react-native";
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
        <LinearGradient
          colors={[Colors.primary[500], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 300,
            opacity: Platform.OS === 'android' ? 0.1 : 0.2
          }}
        />
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
            color={Colors.primary[900]}
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
              Share your code with friends and unlock their spot in Cooture.
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