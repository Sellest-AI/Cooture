import { useAccount } from "@/lib/convex/auth";
import { api, useMutation } from "@/lib/convex/client";
import { claimedAtom } from "@/modules/credits/streak-provider";
import { Block } from "@ui/block";
import { ButtonSlider } from "@ui/button.slider";
import { useNumberIncrement } from "@ui/hooks/use-number-increment";
import { Check, Credits, Gift } from "@ui/icons";
import { Image } from "@ui/image";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { MotiView } from "moti";
import { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { Defs, Path, Stop, Svg, RadialGradient as SVGRadialGradient } from 'react-native-svg';
import { ROUTES } from "routes";
import { Colors } from "theme";

const DELAYS = {
  flame: 0,
  streak: 700,
  calendar: 1300,
  slider: 2100
}

export function PrimaryRadialGradient({ style }: { style?: ViewStyle }) {
  return (
    <Svg
      height="100%"
      width="100%"
      viewBox="0 0 172 172"
      style={{
        ...style,
        position: 'absolute',
      }}
    >
      <Path
        d="M0 0H172V172H0V0Z"
        fill="url(#grad)"
        opacity={0.7}
      />
      <Defs>
        <SVGRadialGradient
          id="grad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(86 86) rotate(90) scale(86 86)"
        >
          <Stop stopColor={Colors.primary[500]} />
          <Stop stopColor={Colors.primary[500]} stopOpacity={0} offset={1} />
        </SVGRadialGradient>
      </Defs>
    </Svg>
  )
}

const getDaysArray = (currentIndex: number) => {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  // Calculate which day the streak started on and rotate the array to start from that day
  const currentDay = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const startDayIndex = (currentDay - currentIndex + 7) % 7;
  const rotatedDays = [...days.slice(startDayIndex), ...days.slice(0, startDayIndex)];
  return rotatedDays;
}

type Props = {
  style?: ViewStyle;
}
const Calendar = ({ style }: Props) => {
  const { wallet } = useAccount.Wallet();
  const nextIndex = (wallet?.streak.dailyClaimStreak ?? 0) + 1;
  const normalizedIndex = nextIndex > 0 ? (nextIndex - 1) % 7 : 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: DELAYS.calendar, duration: 500 }}
    >
      <Block
        variant="blur"
        style={{
          alignContent: 'center',
          width: '100%',
          padding: 20,
          paddingBottom: 24,
          borderRadius: 28,
          ...style
        }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 324,
          gap: 18
        }}>
          <MotiView
            from={{ width: 0 }}
            animate={{ width: (normalizedIndex + 1) * 28 + normalizedIndex * 18 }}
            transition={{ delay: DELAYS.calendar, duration: (normalizedIndex) * 850 }}
            style={{
              backgroundColor: Colors.primary[500],
              position: 'absolute',
              borderRadius: 99,
              opacity: 0.1,
              height: 26,
              top: 30,
              left: 0,
            }}
          />
          {getDaysArray(normalizedIndex).map((d, i) => {
            const showCheck = i <= normalizedIndex;
            const isPrevious = i < normalizedIndex;
            const isCurrent = i === normalizedIndex;
            const dayReward = wallet?.streak.weeklyRewards[i] ?? 0;
            return (
              <View key={`${d}-${i}`} style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 100 + DELAYS.calendar }}
                >
                  <Text.Sm color={Colors.neutral[50]} weight={600}>
                    {d}
                  </Text.Sm>
                </MotiView>
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 400 + DELAYS.calendar }}
                  style={{
                    marginTop: 16,
                    padding: 5,
                    borderRadius: 99,
                    overflow: 'hidden',
                    width: 26,
                    height: 26,
                  }}>
                  <View
                    style={{
                      inset: 0,
                      position: 'absolute',
                      opacity: normalizedIndex === i ? 1 : 0.1,
                      backgroundColor: normalizedIndex < i ?
                        Colors.neutral[400] : Colors.primary[500],
                    }}
                  />
                  {showCheck && <Check
                    style={{ position: 'relative' }}
                    color={normalizedIndex === i ?
                      Colors.primary[900] : Colors.primary[500]}
                    size={16}
                  />}
                </MotiView>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 12,
                    opacity: isPrevious ? 0.8 : isCurrent ? 1 : 0.2,
                  }}
                >
                  <Credits size={10} />
                  <Text.Sm color={Colors.primary[200]} weight={600}>
                    {dayReward}
                  </Text.Sm>
                </View>
              </View>
            )
          })}
        </View>
        <View style={{
          marginTop: 28,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}
        >
          <Text.Base color={Colors.neutral[50]} weight={600}>
            You can claim
          </Text.Base>
          <Credits size={16} />
          <Text.Base color={Colors.primary[200]} weight={600}>
            {wallet?.streak.nextReward}
          </Text.Base>
          <Text.Base color={Colors.neutral[50]} weight={600}>
            today
          </Text.Base>
        </View>
      </Block>
    </MotiView>
  )
}

const FlameComponent = () => {
  // Flickering animations
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    // Scale flickering - subtle pulse
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.98, { duration: 450, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.01, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.99, { duration: 480, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Opacity flickering - brightness variations
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Rotation - subtle wobble
    rotation.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow pulsing
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.05, { duration: 950, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 920, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 950, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 920, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [glowOpacity, glowScale, opacity, rotation, scale]);

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 172,
      height: 172,
    }}
    >
      <View style={{
        overflow: 'visible',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Animated.View style={[{
          position: 'absolute',
          width: 256,
          height: 256,
        }, glowAnimatedStyle]}>
          <PrimaryRadialGradient />
        </Animated.View>
        <Animated.View style={flameAnimatedStyle}>
          <Image
            source={require("assets/images/flame.webp")}
            contentFit="contain"
            style={{ width: 172, height: 172 }}
          />
        </Animated.View>
      </View>
    </View>
  )
}

export default function Screen() {
  const setClaimed = useSetAtom(claimedAtom);
  const { wallet } = useAccount.Wallet();

  const streak = wallet ? wallet?.streak.dailyClaimStreak + 1 : undefined;
  const { displayedValue } = useNumberIncrement(streak, {
    initialValue: 0,
    duration: 5000,
    initialDelay: DELAYS.streak + 500,
  });

  const { mutate: claim } = useMutation(api.router.credits.claimDaily.authed);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 28,
      padding: 12
    }}>
      <View style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
      }}>
        <FlameComponent />
        <MotiView style={{
          marginTop: 56,
          alignItems: 'center',
          paddingHorizontal: 12
        }}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: DELAYS.streak, duration: 500 }}
        >
          <MotiView
            style={{ alignItems: 'center' }}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: DELAYS.streak + 100, duration: 500 }}
          >
            <Text.Max
              color={Colors.primary[500]}
              style={{ fontSize: 96, lineHeight: 102 }}
            >
              {displayedValue}
            </Text.Max>
            <Text.H1 color={Colors.primary[500]}>
              Days Streak
            </Text.H1>
          </MotiView>
          <MotiView
            style={{ alignItems: 'center', width: '65%', marginTop: 28 }}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: DELAYS.streak + 400, duration: 500 }}
          >
            <Text.Base
              color={Colors.neutral[400]}
              weight={600}
              style={{ textAlign: 'center' }}>
              A streak counts how many days you have explored cooture.
            </Text.Base>
          </MotiView>
        </MotiView>
      </View>
      <Calendar style={{
        marginTop: 32,
        marginBottom: 12,
      }}
      />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: DELAYS.slider, duration: 1000 }}
        style={{ width: '100%' }}
      >
        <ButtonSlider
          startIcon={Gift}
          onComplete={async () => {
            setClaimed(true);
            // Await delay 500ms;
            await new Promise(resolve => setTimeout(resolve, 500));

            if (router.canGoBack()) { router.back(); }
            else { router.replace(ROUTES.TABS.FEED); }

            setTimeout(() => { claim().catch(() => null); }, 800);
          }}
        >
          Slide to claim
        </ButtonSlider>
      </MotiView>
    </View>
  )
}