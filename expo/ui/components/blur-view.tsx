import { BlurViewProps, BlurTargetView as ExpoBlurTargetView, BlurView as ExpoBlurView } from 'expo-blur';
import { createContext, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { Platform, View, ViewStyle } from 'react-native';

// export const BlurView = Platform.OS === 'web' ? ExpoBlurView : View;
// export const BlurView = ExpoBlurView;

export const BLUR_INTENSITY = Platform.OS === 'android' ? 12 : 48;
export const BLUR_TINT: BlurViewProps['tint'] = 'dark' as const;
export const BLUR_PROPS: BlurViewProps = {
  intensity: BLUR_INTENSITY,
  blurMethod: 'dimezisBlurViewSdk31Plus' as const,
  tint: BLUR_TINT,
}

type BlurPropsExtended = Omit<BlurViewProps, 'tint' | 'blurMethod' | 'style'> & {
  blurKey?: BlurKeys;
  style?: ViewStyle;
};

export const BlurView = ({ style, blurKey, children, className, ...props }: BlurPropsExtended) => {
  const { blurTargets } = useContext(BlurProviderContext) ?? {};

  const { padding, paddingLeft, paddingRight, paddingHorizontal, paddingVertical,
    paddingBottom, paddingTop, gap, justifyContent, alignItems,
    flexDirection, backgroundColor, ...rest } = style ?? {};

  const [blurTarget, setBlurTarget] = useState(blurKey ? blurTargets?.[blurKey] : null);
  useEffect(() => {
    if (__DEV__) return;
    requestAnimationFrame(() => { setBlurTarget(blurKey ? blurTargets?.[blurKey] : null) });
  }, [blurKey, blurTargets])

  const target = Platform.OS === 'android' ? (blurTarget ?? undefined) : undefined;
  const method = Platform.OS === 'android' ? (blurTarget ? 'dimezisBlurViewSdk31Plus' : 'none') : undefined;

  return <ExpoBlurView
    {...BLUR_PROPS}
    {...props}
    blurTarget={target}
    blurMethod={method}
    style={rest}
  >
    <View
      style={{
        flex: style?.flex === undefined ? 1 : style?.flex,
        flexDirection,
        justifyContent,
        alignItems,
        gap,
        backgroundColor,
        padding,
        paddingLeft,
        paddingRight,
        paddingHorizontal,
        paddingVertical,
        paddingTop,
        paddingBottom,
      }}
      className={className}
    >
      {children}
    </View>
  </ExpoBlurView>;
}

export const BlurTargetView = ({ children, blurKey, style }: { children: React.ReactNode, blurKey: BlurKeys, style?: ViewStyle }) => {
  const { setBlurTarget } = useContext(BlurProviderContext) ?? {};
  const blurTargetRef = useRef<View | null>(null);

  useEffect(() => () => { setBlurTarget?.(blurKey, null); }, [blurKey, setBlurTarget])

  return (
    <ExpoBlurTargetView
      ref={blurTargetRef}
      onLayout={() => { setBlurTarget?.(blurKey, blurTargetRef); }}
      style={{ flex: 1, ...style }}
    >
      {children}
    </ExpoBlurTargetView>
  )
}

type BlurContext = {
  setBlurTarget: (key: string, target: RefObject<View | null> | null) => void;
  blurTargets: Record<string, RefObject<View | null> | null>;
}

const BlurProviderContext = createContext<BlurContext | null>(null);

export const BlurProvider = ({ children }: { children: React.ReactNode }) => {
  const blurRefs = useRef<Record<string, RefObject<View | null> | null>>({});

  const setBlurTarget = (key: string, target: RefObject<View | null> | null) => {
    blurRefs.current[key] = target;
  }

  return (
    <BlurProviderContext.Provider value={{ setBlurTarget, blurTargets: blurRefs.current }}>
      {children}
    </BlurProviderContext.Provider>
  )
}

export enum BlurKeys {
  FEED = 'screen-feed',
  EXPLORE = 'screen-explore',
  NEW = 'screen-new',
  COLLECTION = 'screen-collection',
  PROFILE = 'screen-profile',
  PROFILE_TABS = 'profile-tabs',
  HEADER = 'header',
  STEPPER_LINE = 'stepper-line',
  PHOOTSHOOT_PRESETS_ITEMS = 'photoshoot-presets-items',
}