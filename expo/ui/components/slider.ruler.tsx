import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TICK_SPACING = 20;      // px between each integer step
const MAJOR_TICK_EVERY = 5;   // show label + tall tick every N units
const MAJOR_TICK_HEIGHT = '80%';
const MINOR_TICK_HEIGHT = '40%';
const TICK_WIDTH = 2;

interface RulerSliderProps {
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  onValueChange?: (value: number) => void;
  color?: string;
}

export default function RulerSlider({
  initialValue = 65,
  minValue = 40,
  maxValue = 160,
  onValueChange,
  color = '#ffffff',
}: RulerSliderProps) {
  const [cachedInitialValue] = useState(initialValue);

  const scrollRef = useRef<ScrollView>(null);
  const currentValue = useRef(cachedInitialValue);

  const totalTicks = maxValue - minValue + 1;
  const sidePadding = Math.round((SCREEN_WIDTH - TICK_SPACING) / 2);
  const initialOffset = (cachedInitialValue - minValue) * TICK_SPACING;

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const tickValue = minValue + i;
    const isMajor = tickValue % MAJOR_TICK_EVERY === 0;
    return { tickValue, isMajor, index: i };
  });

  const offsetToValue = useCallback((offsetX: number) => {
    const index = Math.round(offsetX / TICK_SPACING);
    return Math.min(maxValue, Math.max(minValue, minValue + index));
  }, [minValue, maxValue]);

  const valueToOffset = useCallback((value: number) => {
    const index = value - minValue;
    return index * TICK_SPACING;
  }, [minValue]);

  const snapToValue = useCallback((value: number, animated?: boolean) => {
    const offset = valueToOffset(value);
    scrollRef.current?.scrollTo({ x: offset, animated: animated ?? true });
  }, [valueToOffset]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newValue = offsetToValue(e.nativeEvent.contentOffset.x);
      if (newValue !== currentValue.current) {
        currentValue.current = newValue;
        onValueChange?.(newValue);

        if (ticks.find(t => t.tickValue === newValue)?.isMajor)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
    },
    [offsetToValue, onValueChange, ticks]
  );

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const newValue = offsetToValue(x);
      // Snap to perfectly aligned offset
      snapToValue(newValue, true);
    },
    [offsetToValue, snapToValue]
  );

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // If there's no momentum, we snap immediately.
      // If there is momentum, onMomentumScrollEnd will handle it.
      const velocity = e.nativeEvent.velocity?.x ?? 0;
      if (Math.abs(velocity) < 0.1) {
        const x = e.nativeEvent.contentOffset.x;
        const newValue = offsetToValue(x);
        snapToValue(newValue, false);
      }
    },
    [offsetToValue, snapToValue]
  );

  return (
    <View style={styles.container}>
      {/* Fixed center indicator — the ruler scrolls beneath it */}
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: color,
            left: SCREEN_WIDTH / 2 - 1.5,
          },
        ]}
      >
        <View
          style={{
            position: 'absolute',
            inset: -3,
            backgroundColor: color,
            borderRadius: 4,
            opacity: 0.2,
          }}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="normal"
        contentOffset={{ x: initialOffset, y: 0 }}
        onLayout={() => snapToValue(cachedInitialValue, true)}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: sidePadding },
        ]}
      >
        <View style={styles.ruler}>
          {ticks.map(({ tickValue, isMajor, index }) => (
            <View key={index} style={styles.tickWrapper}>
              <View
                style={[
                  styles.tick,
                  {
                    height: isMajor ? MAJOR_TICK_HEIGHT : MINOR_TICK_HEIGHT,
                    width: isMajor ? TICK_WIDTH : TICK_WIDTH,
                    opacity: isMajor ? 0.6 : 0.3,
                    backgroundColor: color,
                  },
                ]}
              />
              {isMajor && (
                <Text style={[styles.label, { color: color, opacity: 0.8 }]}>
                  {tickValue}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 96,
    width: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  ruler: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  tickWrapper: {
    width: TICK_SPACING,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  tick: {
    borderRadius: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
    width: 32,
    textAlign: 'center',
    letterSpacing: 0.2,
    position: 'absolute',
    bottom: -14,
  },
  indicator: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    zIndex: 10,
  },
});