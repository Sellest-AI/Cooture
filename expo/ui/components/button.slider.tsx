import * as Haptics from 'expo-haptics';
import React, { ComponentProps, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Colors } from "theme";
import { Button } from "./button";
import { ChevronRight, Loader } from "./icons";

type Props = {
  onComplete?: () => Promise<boolean> | boolean;
  startIcon?: ComponentProps<typeof Button>['startIcon'];
  endIcon?: ComponentProps<typeof Button>['endIcon'];
  children?: ComponentProps<typeof Button>['children'];
  disabled?: boolean;
};

export const ButtonSlider = ({ onComplete, startIcon, endIcon, children, disabled: _disabled }: Props) => {
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const TRACK_HEIGHT = 52;
  const KNOB_WIDTH = 170;
  const GAP = 8;

  const translateX = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);
  const currentX = useRef(0);
  const startX = useRef(0);
  const knobWidth = useRef<number>(KNOB_WIDTH);
  const knobOpacity = useRef(new Animated.Value(1)).current;
  const knobScale = useRef(new Animated.Value(1)).current;

  const [loading, setLoading] = useState(false);
  const disabled = _disabled || loading;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const getMax = () => {
    const w = layoutWidth ?? 320;
    const kw = knobWidth.current || KNOB_WIDTH;
    return Math.max(0, w - kw + GAP);
  };

  const reset = () => {
    completed.current = false;
    setLoading(false);
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 180, useNativeDriver: false }),
      Animated.timing(knobOpacity, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.timing(knobScale, { toValue: 1, duration: 180, useNativeDriver: false }),
    ]).start(({ finished }) => { if (finished) currentX.current = 0; });
  };

  const sharedFinish = async ({ finished, max }: { finished: boolean; max: number }) => {
    if (loading) return;
    if (!finished) return;

    currentX.current = max;
    setLoading(true);

    let shouldReset = true;
    try {
      const result = await onCompleteRef.current?.();
      if (result === true) shouldReset = false;
    } catch (error) {
      console.error("ButtonSlider onComplete error:", error);
      shouldReset = true;
    }

    if (!shouldReset) return;

    requestAnimationFrame(() => { reset(); });
  };

  const completeSlide = (max: number, duration = 180) => {
    if (completed.current) return;
    completed.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(translateX, { toValue: max, duration, useNativeDriver: false }),
      Animated.timing(knobOpacity, { toValue: 0, duration, useNativeDriver: false }),
      Animated.timing(knobScale, { toValue: 1.1, duration, useNativeDriver: false }),
    ]).start(async ({ finished }) => sharedFinish({ finished, max }));
  };

  const snapBack = () => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
      Animated.timing(knobOpacity, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.spring(knobScale, { toValue: 1, useNativeDriver: false }),
    ]).start(({ finished }) => { if (finished) currentX.current = 0; });
  };

  const lastHaptic = useRef(0);
  const triggerHaptic = (pourcent: number) => {
    const now = Date.now();
    if (now - lastHaptic.current < 100) return;
    lastHaptic.current = now;
    Haptics.impactAsync(
      pourcent > 0.5 ? Haptics.ImpactFeedbackStyle.Heavy :
        pourcent > 0.2 ? Haptics.ImpactFeedbackStyle.Medium :
          Haptics.ImpactFeedbackStyle.Soft
    );
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    // Claim gesture once user moves 10px right; fail immediately on leftward swipe
    // so the iOS swipe-back still works naturally from the screen edge.
    .activeOffsetX([0, 10])
    .failOffsetX(-5)
    .runOnJS(true) // run callbacks on JS thread so we can call Animated + setState
    .onBegin(() => {
      startX.current = currentX.current;
    })
    .onUpdate((e) => {
      if (completed.current) return;
      const max = getMax();
      let value = startX.current + e.translationX;
      if (value < 0) value = 0;
      if (value > max) value = max;
      translateX.setValue(value);
      currentX.current = value;

      const pourcent = value / max;
      triggerHaptic(pourcent);

      if (value >= max * 0.95) {
        completeSlide(max, 180);
      }
    })
    .onEnd((e) => {
      if (completed.current) return;
      const max = getMax();
      const val = currentX.current;
      const threshold = max * 0.9;
      const projected = val + (e.velocityX ?? 0) * 0.2;

      if (projected >= threshold || val >= threshold) {
        completeSlide(max, 220);
      } else {
        snapBack();
      }
    })
    .onFinalize(() => {
      // Covers cancellation (e.g. incoming call interrupts gesture)
      if (!completed.current) snapBack();
    });

  const knobStyle = {
    opacity: knobOpacity,
    transform: [{ translateX }, { scale: knobScale }],
  } as any;

  return (
    <View
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      style={[styles.container, { height: TRACK_HEIGHT + 8 }]}
    >
      <View
        style={[styles.track, {
          height: TRACK_HEIGHT + GAP,
          backgroundColor: disabled ? Colors.primary[700] : Colors.primary[500],
          opacity: disabled ? 0.7 : 1,
        }]}
      />

      <View style={{ position: "absolute", right: 12, flexDirection: "row", alignItems: "center", opacity: loading ? 0 : 1 }}>
        <ChevronRight color={Colors.primary[900]} style={{ opacity: 0.45, marginRight: -8 }} size={24} />
        <ChevronRight color={Colors.primary[900]} style={{ opacity: 0.5, marginRight: -8 }} size={24} />
        <ChevronRight color={Colors.primary[900]} style={{ opacity: 0.6 }} size={24} />
      </View>

      <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', opacity: loading ? 1 : 0 }}>
        <Loader color={Colors.primary[900]} />
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.knob, knobStyle, { height: TRACK_HEIGHT, left: GAP / 2 }]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w && knobWidth.current !== w) knobWidth.current = w;
          }}
        >
          <Button
            disabled={disabled}
            variant="primary"
            startIcon={startIcon}
            endIcon={endIcon}
            style={{ borderRadius: 20, height: TRACK_HEIGHT }}
          >
            {children}
          </Button>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
    overflow: "hidden",
  },
  track: {
    borderRadius: 22,
    width: "100%",
  },
  labelContainer: {
    position: "absolute",
    left: 20,
  },
  knob: {
    position: "absolute",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: -6, height: 10 },
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  knobContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});