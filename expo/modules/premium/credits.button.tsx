import { ROUTES, useRouter } from "@/hooks"
import { useAccount } from "@/lib/convex/auth"
import { Credits, Loader } from "@ui/icons"
import { LinearGradient } from "@ui/linear-gradient"
import { Pressable } from "@ui/pressable"
import { Skeleton } from "@ui/skeleton"
import { Text } from "@ui/text"
import { ViewStyle } from "react-native"
import { Colors } from "theme"

type Props = {
  style?: ViewStyle;
  onPress?: () => void;
}

export const CreditsButton = ({ style, onPress }: Props) => {
  const { wallet } = useAccount.Wallet();
  const { push } = useRouter();

  return (
    <Pressable
      style={{
        backgroundColor: Colors.primary[500],
        paddingLeft: 14,
        paddingRight: 15,
        paddingTop: 8,
        paddingBottom: 9,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 99,
        ...style,
      }}
      onPress={onPress ? () => onPress() :
        () => { push(ROUTES.MODALS.UPGRADE); }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }} // Left center
        end={{ x: 1, y: 0.5 }}   // Right center
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          opacity: style?.opacity
        }}
      />
      {wallet ? <Credits size={20} /> :
        <Loader size={20} />}
      {!wallet ? <Skeleton
        style={{
          opacity: 0.3,
          width: 36,
          height: 18,
        }}
      /> :
        <Text.Lg
          color={Colors.primary[900]}
          style={{ opacity: 0.8 }}
          weight={700}
        >
          {wallet?.credits}
        </Text.Lg>}
    </Pressable>
  )
}