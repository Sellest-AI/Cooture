import { useEffect, useRef } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { BLUR_PROPS, BlurView } from "./blur-view";
import { Check } from "./icons";
import { LinearGradient } from "./linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from './motion';
import { Text } from './text';

type StepProps = {
  active?: boolean;
  children: string;
  delay?: number;
}

const Step = ({ active, children, delay = 0 }: StepProps) => {
  const Component = active ? View : BlurView;
  const customProps = active ? {} : BLUR_PROPS;

  const scale = useSharedValue(active ? 1.05 : 1);
  const prevActive = useRef(active);

  useEffect(() => {
    const isDeactivating = prevActive.current && !active;
    const actualDelay = isDeactivating ? 0 : delay;

    scale.value = withDelay(
      actualDelay,
      withSpring(active ? 1.1 : 1, {
        damping: 12,
        stiffness: 150,
      })
    );

    prevActive.current = active;
  }, [active, scale, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Component
        {...customProps}
        style={{
          borderRadius: 99,
          backgroundColor: active ? Colors.primary[500] : Colors.blur.medium,
          borderColor: active ? Colors.primary[200] : Colors.blur.light,
          borderStartWidth: 1,
          width: 28,
          height: 28,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <Text.Sm
          style={{
            color: active ? Colors.primary[900] : Colors.neutral[50],
            fontWeight: '700'
          }}
        >
          {active ? <Check size={12} strokeWidth={3} /> : children}
        </Text.Sm>
      </Component>
    </Animated.View>
  )
}

type LineProps = {
  active: boolean;
  inProgress: boolean;
  delay?: number;
  reverseDelay?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Line = ({ active, inProgress, delay = 0, reverseDelay = 0 }: LineProps) => {
  const targetProgress = active ? 1 : inProgress ? 0.7 : 0;
  const progress = useSharedValue(targetProgress);
  const prevTargetProgress = useRef(targetProgress);

  useEffect(() => {
    const isDeactivating = prevTargetProgress.current > targetProgress;
    const actualDelay = isDeactivating ? reverseDelay : delay;

    progress.value = withDelay(
      actualDelay,
      withTiming(targetProgress, {
        duration: 300,
      })
    );

    prevTargetProgress.current = targetProgress;
  }, [active, inProgress, progress, targetProgress, delay, reverseDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
    transformOrigin: 'left',
  }));

  const gradientColors = inProgress
    ? [Colors.primary[500], Colors.blur.medium]
    : active
      ? [Colors.primary[500], Colors.primary[500]]
      : [Colors.blur.medium, Colors.blur.medium];

  return (
    <BlurView
      {...BLUR_PROPS}
      style={{ flex: 1, height: 6 }}
    >
      <View
        style={{
          backgroundColor: Colors.blur.light,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1
        }}
      />
      <AnimatedLinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            height: '100%',
            width: '100%',
          },
          animatedStyle
        ]}
      />
    </BlurView>
  );
};

type StepperProps = {
  value: 0 | 1 | 2 | 3;
  style?: ViewStyle;
}

export const Stepper = ({ value, style }: StepperProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      <Step active={value >= 1}>1</Step>
      <Line active={value >= 2} inProgress={value === 1} delay={0} reverseDelay={400} />
      <Step active={value >= 2} delay={200}>2</Step>
      <Line active={value >= 3} inProgress={value === 2} delay={400} />
      <Step active={value >= 3} delay={800}>3</Step>
    </View>
  )
}