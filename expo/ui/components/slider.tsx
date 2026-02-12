import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { Colors } from "theme";
import { Text } from './text';

type Props = {
  /** Current slider value (0-1) */
  value: number;
  /** Slider label */
  label?: string;
  /** Text to be displayed when close to the value */
  labels?: { value: number; label: string }[];
  /**
   * @param value - current slider value (0-1)
   * @param closestValue - value of the closest label (0-1) or current value if there is no label
   */
  onValueChange?: (value: number, closestValue: number) => void;
  style?: ViewStyle;
  customHeight?: number;
};

type LabelIndicatorProps = {
  position: number;
  translationX: SharedValue<number>;
  knobSize: number;
  trackHeight: number;
  onPress?: () => void;
};

const LabelIndicator = ({ position, translationX, knobSize, trackHeight, onPress }: LabelIndicatorProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const hasPassed = translationX.value + knobSize / 2 >= position;
    return {
      opacity: hasPassed ? 0.1 : 0.3,
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          left: position - trackHeight / 2,
          backgroundColor: Colors.blur.medium,
          position: 'absolute',
          height: '100%',
          aspectRatio: 1,
          borderRadius: 99,
        }
      ]}
    >
      <Pressable style={{ flex: 1 }} onPress={onPress} />
    </Animated.View>
  );
};

export const Slider = ({ value, label, labels, onValueChange, style, customHeight }: Props) => {
  const TRACK_HEIGHT = customHeight ?? 32;
  const KNOB_SIZE = TRACK_HEIGHT;

  const [width, setWidth] = useState(0);
  const translationX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Find closest label to a given value
  const findClosestLabel = useCallback((val: number) => {
    'worklet';
    if (!labels || labels.length === 0) return val;

    let closestLabel = labels[0];
    let minDistance = Math.abs(val - labels[0].value);

    for (const labelItem of labels) {
      const distance = Math.abs(val - labelItem.value);
      if (distance < minDistance) {
        minDistance = distance;
        closestLabel = labelItem;
      }
    }

    return closestLabel.value;
  }, [labels]);

  // Update value based on translation
  const updateValue = (translation: number) => {
    const maxTranslation = width - KNOB_SIZE;
    const clampedTranslation = Math.max(0, Math.min(translation, maxTranslation));
    const newValue = maxTranslation > 0 ? clampedTranslation / maxTranslation : 0;
    const closestValue = findClosestLabel(newValue);

    if (onValueChange) {
      onValueChange(newValue, closestValue);
    }
  };

  // Initialize position when width changes
  const onLayout = (event: LayoutChangeEvent) => {
    const newWidth = event.nativeEvent.layout.width;
    setWidth(newWidth);
    const maxTranslation = newWidth - KNOB_SIZE;
    translationX.value = value * maxTranslation;
  };

  // Pan gesture with modern API
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      startX.value = translationX.value;
    })
    .onUpdate((event) => {
      const maxTranslation = width - KNOB_SIZE;
      const newX = startX.value + event.translationX;
      translationX.value = Math.max(0, Math.min(newX, maxTranslation));
    })
    .onEnd((event) => {
      isDragging.value = false;
      const maxTranslation = width - KNOB_SIZE;

      // Use velocity for a natural fling effect
      const velocityX = event.velocityX;

      // Apply decay animation with velocity
      translationX.value = withDecay({
        velocity: velocityX,
        clamp: [0, maxTranslation],
        deceleration: 0.7,
      }, (finished) => {
        if (finished) {
          // After decay, snap to closest label
          const currentValue = maxTranslation > 0 ? translationX.value / maxTranslation : 0;
          const closestValue = findClosestLabel(currentValue);
          translationX.value = withSpring(closestValue * maxTranslation, {
            damping: 40,
            stiffness: 300,
          });
          runOnJS(updateValue)(closestValue * maxTranslation);
        }
      });

    });

  // Animated styles for the knob
  const knobStyle = useAnimatedStyle(() => {
    const translation = Math.max(-KNOB_SIZE / 2,
      Math.min(translationX.value, width));

    return {
      transform: [{ translateX: translation }],
    };
  });

  // Animated styles for the filled track
  const filledTrackStyle = useAnimatedStyle(() => {
    return {
      width: translationX.value + KNOB_SIZE,
    };
  });

  // Get current label text
  const currentLabel = useMemo(() => {
    if (!labels || labels.length === 0) return null;
    const closestValue = findClosestLabel(value);
    const labelItem = labels.find((l) => l.value === closestValue);
    return labelItem?.label || "";

  }, [labels, findClosestLabel, value]);

  return (
    <View className="w-full" style={{ ...style }}>
      {/* Header with label and current value */}
      <View className="flex-row items-center justify-between mb-3">
        {label && <Text.Base color={Colors.neutral[400]} weight={600}>
          {label}
        </Text.Base>}
        {currentLabel && <Text.Base color={Colors.neutral[50]} weight={600}>
          {currentLabel}
        </Text.Base>}
      </View>

      {/* Slider track */}
      <View
        className="relative w-full rounded-full"
        style={{ height: TRACK_HEIGHT, backgroundColor: Colors.blur.dark }}
        onLayout={onLayout}
      >
        {/* Filled portion */}
        <Animated.View
          className="absolute top-0 left-0 h-full"
          style={[filledTrackStyle, {
            backgroundColor: Colors.primary[500],
            height: '100%',
            position: 'absolute',
            borderRadius: 99
          }]}
        />

        {/* Label indicators */}
        {labels && <View className="absolute top-0 left-0 flex-row items-center w-full h-full">
          {labels.map((labelItem, index) => {
            const maxTranslation = width - KNOB_SIZE;
            const position = labelItem.value * maxTranslation;

            return (
              <LabelIndicator
                key={index}
                position={position + (KNOB_SIZE / 2)}
                translationX={translationX}
                knobSize={KNOB_SIZE}
                trackHeight={TRACK_HEIGHT}
                onPress={() => {
                  // Snap to closest label
                  translationX.value = withSpring(position);
                  runOnJS(updateValue)(position);
                }}
              />
            );
          })}
        </View>}

        {/* Draggable knob */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="absolute top-0 rounded-full"
            style={[
              { width: KNOB_SIZE, height: KNOB_SIZE },
              knobStyle,
              {
                backgroundColor: Colors.primary[500],
                borderRadius: 99
              }
            ]}
          />
        </GestureDetector>
      </View>
    </View>
  );
};