import { ROUTES, useRouter } from "@/hooks"
import { useAccount } from "@/lib/convex/auth"
import { useNumberIncrement } from "@ui/hooks/use-number-increment"
import { Credits, Loader } from "@ui/icons"
import { LinearGradient } from "@ui/linear-gradient"
import Odometer from "@ui/odometer"
import { Pressable } from "@ui/pressable"
import { Skeleton } from "@ui/skeleton"
import { useState } from "react"
import { ViewStyle } from "react-native"
import { Colors, Texts } from "theme"

type Props = {
  style?: ViewStyle;
  onPress?: () => void;
}

export const CreditsButton = ({ style, onPress }: Props) => {
  const { wallet } = useAccount.Wallet();
  const { push } = useRouter();

  const [wasInit] = useState(!!wallet);
  const { displayedValue } = useNumberIncrement(wallet?.credits, {
    duration: 2000,
    initialValue: wasInit ? wallet?.credits ?? 0 :
      (wallet ? wallet.credits * 0.7 : undefined),
  });

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
        <Loader size={20} style={{ opacity: 0.5 }} />}
      {!wallet ? <Skeleton
        style={{
          opacity: 0.3,
          width: 36,
          height: 18,
        }}
      /> :
        <Odometer
          color={Colors.primary[900]}
          style={{ opacity: 0.8 }}
          value={displayedValue}
          fontSize={Texts.lg.fontSize}
        />}
    </Pressable>
  )
}