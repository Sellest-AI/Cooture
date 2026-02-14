import React, { ComponentProps, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";
import { Colors } from "theme";
import { Button } from "./button";
import { ChevronRight, Loader } from "./icons";

type Props = {
  onComplete?: () => void;
  startIcon?: ComponentProps<typeof Button>['startIcon'];
  endIcon?: ComponentProps<typeof Button>['endIcon'];
  children?: ComponentProps<typeof Button>['children'];
  disabled?: boolean;
};

export const ButtonSlider = ({ onComplete, startIcon, endIcon, children, disabled }: Props) => {
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const TRACK_HEIGHT = 52;
  const KNOB_WIDTH = 170; // default/fallback
  const GAP = 8;

  const translateX = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);
  const currentX = useRef(0);
  const startX = useRef(0);
  const knobWidth = useRef<number>(KNOB_WIDTH);
  const knobOpacity = useRef(new Animated.Value(1)).current;
  const knobScale = useRef(new Animated.Value(1)).current;
  const [showLoader, setShowLoader] = useState(false);

  // Keep onComplete reference up-to-date to avoid stale closures in PanResponder
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track disabled state in ref for PanResponder
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const onLayout = (e: any) => {
    setLayoutWidth(e.nativeEvent.layout.width);
  };

  const getMax = () => {
    const w = layoutWidth ?? 320;
    const kw = knobWidth.current || KNOB_WIDTH;
    return Math.max(0, w - kw + GAP);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      // Only become responder if horizontal movement dominates to avoid blocking vertical ScrollView
      onMoveShouldSetPanResponder: (_, gs) => !disabledRef.current && Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 6,
      onMoveShouldSetPanResponderCapture: (_, gs) => !disabledRef.current && Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 6,
      // Prevent parent from taking over during an active horizontal drag
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startX.current = currentX.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx ?? 0;
        const max = getMax();
        let value = startX.current + dx;
        if (value < 0) value = 0;
        if (value > max) value = max;
        translateX.setValue(value);
        currentX.current = value;
        // Auto-complete at 90%
        const autoThreshold = max * 0.9;
        if (!completed.current && value >= autoThreshold) {
          completed.current = true;
          Animated.parallel([
            Animated.timing(translateX, { toValue: max, duration: 180, useNativeDriver: false }),
            Animated.timing(knobOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
            Animated.timing(knobScale, { toValue: 1.1, duration: 180, useNativeDriver: false }),
          ]).start(({ finished }) => {
            if (finished) {
              currentX.current = max;
              setShowLoader(true);
              onCompleteRef.current?.();
            }
          });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const vx = gestureState.vx ?? 0; // velocity in px/s (approx)
        const max = getMax();
        const val = currentX.current;
        const threshold = max * 0.9;

        // Projected position based on fling velocity. Multiplier tuned to give ~200-300ms projection.
        const VELOCITY_MS = 0.2; // seconds to project
        const projected = val + vx * VELOCITY_MS;

        if (!completed.current && projected >= threshold) {
          // velocity fling will reach threshold -> complete
          completed.current = true;
          Animated.parallel([
            Animated.timing(translateX, { toValue: max, duration: 220, useNativeDriver: false }),
            Animated.timing(knobOpacity, { toValue: 0, duration: 220, useNativeDriver: false }),
            Animated.timing(knobScale, { toValue: 1.1, duration: 220, useNativeDriver: false }),
          ]).start(({ finished }) => {
            if (finished) {
              currentX.current = max;
              setShowLoader(true);
              onCompleteRef.current?.();
            }
          });
          return;
        }

        // If no fling to complete, use current position to decide
        if (val >= threshold) {
          if (!completed.current) completed.current = true;
          Animated.parallel([
            Animated.timing(translateX, { toValue: max, duration: 180, useNativeDriver: false }),
            Animated.timing(knobOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
            Animated.timing(knobScale, { toValue: 1.1, duration: 180, useNativeDriver: false }),
          ]).start(({ finished }) => {
            if (finished) {
              currentX.current = max;
              setShowLoader(true);
              onCompleteRef.current?.();
            }
          });
        } else {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
            Animated.timing(knobOpacity, { toValue: 1, duration: 120, useNativeDriver: false }),
            Animated.spring(knobScale, { toValue: 1, useNativeDriver: false }),
          ]).start(({ finished }) => {
            if (finished) currentX.current = 0;
          });
        }
      },
    })
  ).current;

  const knobStyle = {
    opacity: knobOpacity,
    transform: [{ translateX }, { scale: knobScale }],
  } as any;

  return (
    <View onLayout={onLayout} style={[
      styles.container,
      { height: TRACK_HEIGHT + 8 },
    ]}>
      <View style={[styles.track, {
        height: TRACK_HEIGHT + GAP,
        backgroundColor: disabled ? Colors.primary[700] : Colors.primary[500],
        opacity: disabled ? 0.7 : 1,
      }]} />

      {!showLoader && <View style={{
        position: "absolute",
        right: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
      >
        <ChevronRight color={Colors.primary[900]} style={{ opacity: 0.45, marginRight: -8 }} size={24} />
        <ChevronRight color={Colors.primary[900]} style={{ opacity: 0.5, marginRight: -8 }} size={24} />
        <ChevronRight color={Colors.primary[900]} style={{ opacity: 0.6 }} size={24} />
      </View>}

      {showLoader && <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Loader color={Colors.primary[900]} />
      </View>}

      <Animated.View
        {...pan.panHandlers}
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
    borderRadius: 20,
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
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 20,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  knobContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});