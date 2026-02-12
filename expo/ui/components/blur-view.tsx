import { BlurViewProps, BlurView as ExpoBlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
export const BlurView = Platform.OS === 'web' ? ExpoBlurView : View;
// export const BlurView = ExpoBlurView;

export const BLUR_INTENSITY = 64;
export const BLUR_TINT: BlurViewProps['tint'] = 'dark' as const;
export const BLUR_PROPS = {
  intensity: BLUR_INTENSITY,
  experimentalBlurMethod: 'dimezisBlurView' as const,
  tint: BLUR_TINT,
}

