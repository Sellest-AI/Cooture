import React, { useCallback, useEffect, useRef } from 'react';
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
  const scrollRef = useRef<ScrollView>(null);
  const currentValue = useRef(initialValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { snapToValue(initialValue) }, [])

  const totalTicks = maxValue - minValue + 1;
  const sidePadding = (SCREEN_WIDTH - TICK_SPACING) / 2;
  const initialOffset = (initialValue - minValue) * TICK_SPACING;

  const offsetToValue = useCallback((offsetX: number) => {
    const index = Math.round(offsetX / TICK_SPACING);
    return Math.min(maxValue, Math.max(minValue, minValue + index));
  }, [minValue, maxValue]);

  const valueToOffset = useCallback((value: number) => {
    const index = value - minValue;
    return index * TICK_SPACING;
  }, [minValue]);

  const snapToValue = useCallback((value: number) => {
    const offset = valueToOffset(value);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [valueToOffset]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newValue = offsetToValue(e.nativeEvent.contentOffset.x);
      if (newValue !== currentValue.current) {
        currentValue.current = newValue;
        onValueChange?.(newValue);
      }
    },
    [offsetToValue, onValueChange]
  );

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    const tickValue = minValue + i;
    const isMajor = tickValue % MAJOR_TICK_EVERY === 0;
    return { tickValue, isMajor, index: i };
  });

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
        snapToInterval={TICK_SPACING}
        decelerationRate="fast"
        contentOffset={{ x: initialOffset, y: 0 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: sidePadding },
        ]}
        style={{ scrollSnapType: 'x mandatory' } as any}
      >
        <View style={styles.ruler}>
          {ticks.map(({ tickValue, isMajor, index }) => (
            <View key={index} style={[styles.tickWrapper, { scrollSnapAlign: 'center' } as any]}>
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
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
    position: 'absolute',
    bottom: 2,
    transform: [{ translateY: "100%" }],
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