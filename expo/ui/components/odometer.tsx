import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Texts } from 'theme';

// Each digit column scrolls through 0–9
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface DigitColumnProps {
  digit: number;
  digitHeight: number;
  color: string;
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  duration: number;
  delay: number;
}

function DigitColumn({
  digit,
  digitHeight,
  color,
  fontSize,
  fontWeight,
  duration,
  delay,
}: DigitColumnProps) {
  const animatedValue = useRef(new Animated.Value(digit)).current;
  const prevDigit = useRef(digit);

  useEffect(() => {
    const prev = prevDigit.current;
    const next = digit;

    // Always scroll downward: if next > prev go down naturally,
    // if next < prev (e.g. 9→0 rollover when carrying) scroll past 9 to reach next
    // We do this by animating to next directly — Animated handles decimals,
    // so we just always animate to the target digit 0-9.
    // For direction: going 0→9 when decreasing feels wrong, so we detect direction
    // from the parent value, not digit alone. Simple approach: always animate
    // from prev to next via shortest path (wrapping through 10 if needed).

    let from = prev;
    let to = next;

    // If we'd have to go backwards more than forward, wrap around
    // e.g. 8→2: going 8→9→0→1→2 (wrap up) vs 8→7→...→2 (go back 6 steps)
    // We want upward (increasing) animation to feel natural for incrementing values
    // Default: always go upward (wrap through 10)
    if (to < from) {
      to = to + 10;
    }

    animatedValue.setValue(from);
    Animated.timing(animatedValue, {
      toValue: to,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Reset to actual digit without animation so future animations start correctly
      animatedValue.setValue(digit);
      prevDigit.current = digit;
    });
  }, [animatedValue, delay, digit, duration]);

  const translateY = animatedValue.interpolate({
    inputRange: Array.from({ length: 11 }, (_, i) => i),
    outputRange: Array.from({ length: 11 }, (_, i) => -i * digitHeight),
  });

  return (
    <View style={[styles.digitWindow, { height: digitHeight }]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {/* Render 0–9 plus a duplicate 0–9 to allow wrap-around animation */}
        {[...DIGITS, ...DIGITS].map((d, i) => (
          <View key={i} style={{ height: digitHeight, justifyContent: 'center' }}>
            <Text style={[styles.digitText, { color, fontSize, fontWeight, lineHeight: digitHeight }]}>
              {d}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

interface OdometerProps {
  value: number;
  /** Height of each digit row, controls font size proportionally */
  digitHeight?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  /** Animation duration in ms */
  duration?: number;
  /** Stagger delay between columns (rightmost first) in ms */
  staggerDelay?: number;
  style?: ViewStyle;
  /** Optional suffix like "kg", "lbs" */
  suffix?: string;
  suffixStyle?: TextStyle;
  /** Optional prefix like "Height: " */
  prefix?: string;
  prefixStyle?: TextStyle;
}

export default function Odometer({
  value,
  color = '#ffffff',
  fontSize = 48,
  fontWeight = '700',
  duration = 500,
  staggerDelay = 40,
  style,
  suffix,
  suffixStyle,
  prefix,
  prefixStyle,
}: OdometerProps) {
  // Split value into individual digits, always show at least 1 digit
  const digits = String(Math.max(0, Math.floor(value))).split('').map(Number);

  const suffixFontSize = Math.max(fontSize * 0.45, Texts.sm.fontSize);

  return (
    <View style={[styles.container, style]}>
      {prefix && (
        <Text style={[styles.suffix, {
          color,
          fontSize: suffixFontSize,
          lineHeight: suffixFontSize,
          marginBottom: Math.round(fontSize * 0.15),
          marginLeft: 0,
          marginRight: styles.suffix.marginLeft,
        }, prefixStyle]}>
          {prefix}
        </Text>
      )}
      {digits.map((digit, i) => {
        // Stagger from right to left: rightmost digit animates first
        const stagger = (digits.length - 1 - i) * staggerDelay;
        return (
          <DigitColumn
            key={i}
            digit={digit}
            digitHeight={fontSize * 1.2}
            color={color}
            fontSize={fontSize}
            fontWeight={fontWeight}
            duration={duration}
            delay={stagger}
          />
        );
      })}
      {suffix && (
        <Text style={[styles.suffix, {
          color,
          fontSize: suffixFontSize,
          lineHeight: suffixFontSize,
          marginBottom: Math.round(fontSize * 0.15),
        }, suffixStyle]}>
          {suffix}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  digitWindow: {
    overflow: 'hidden',
  },
  digitText: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  suffix: {
    fontWeight: '600',
    marginLeft: 4,
    opacity: 0.6,
  },
});