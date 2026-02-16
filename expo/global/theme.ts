/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/),
 */

import { Platform } from 'react-native';

export const Texts = {
  max: {
    fontSize: 74,
    lineHeight: Platform.select({ ios: 67, android: 76, default: 67 }),
    letterSpacing: -3.7,
    fontFamily: 'Murays'
  },
  h1: {
    fontSize: 36,
    lineHeight: Platform.select({ ios: 36, android: 40, default: 36 }),
    letterSpacing: -1.8,
    fontWeight: 700,
    alt: {
      fontSize: 40,
      letterSpacing: -2,
      lineHeight: Platform.select({ ios: 36, android: 44, default: 36 }),
      fontWeight: 600,
      fontFamily: 'Murays'
    }
  },
  h3: {
    fontSize: 28,
    lineHeight: 28,
    letterSpacing: -2,
    fontWeight: 600,
    alt: {
      fontSize: 32,
      lineHeight: 29,
      letterSpacing: -0.3,
      fontWeight: 600,
      fontFamily: 'Murays'
    }
  },
  h4: {
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: -1.2,
    fontWeight: 600,
  },
  lg: {
    fontSize: 17,
    lineHeight: 18.7,
    letterSpacing: -0.7,
    fontWeight: 600
  },
  base: {
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.75,
    fontWeight: 400
  },
  sm: {
    fontSize: 13,
    lineHeight: 14,
    letterSpacing: -0.78,
    fontWeight: 400
  }
} as const;

export const Colors = {
  background: 'hsl(0, 0%, 3%)',
  foreground: 'hsl(0, 0%, 100%)',
  neutral: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 94%)',
    200: 'hsl(0, 0%, 87%)',
    400: 'hsl(0, 0%, 66%)',
    800: 'hsl(0, 0%, 3%)',
    900: 'hsl(0, 0%, 0%)',
  },
  blur: {
    light: 'hsla(0, 0%, 84%, 0.20)',
    medium: 'hsla(0, 0%, 24%, 0.60)',
    dark: 'hsla(0, 0%, 14%, 0.8)',
    darkest: 'hsla(0, 0%, 6%, 0.80)',
  },
  primary: {
    200: 'hsl(74, 100%, 82%)',
    500: 'hsl(74, 100%, 56%)',
    700: 'hsl(81, 69%, 35%)',
    900: 'hsl(76, 100%, 5%)',
  },
  secondary: {
    200: 'hsl(311, 100%, 82%)',
    500: 'hsl(314, 100%, 68%)',
    700: 'hsl(314, 63%, 28%)',
    900: 'hsl(300, 100%, 3%)',
  },
  destructive: {
    50: 'hsl(0, 0%, 100%)',
    500: 'hsl(0, 85%, 54%)',
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
