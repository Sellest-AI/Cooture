import { BlurViewProps, BlurTargetView as ExpoBlurTargetView, BlurView as ExpoBlurView } from 'expo-blur';
import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

// export const BlurView = Platform.OS === 'web' ? ExpoBlurView : View;
// export const BlurView = ExpoBlurView;

export const BLUR_INTENSITY = 64;
export const BLUR_TINT: BlurViewProps['tint'] = 'dark' as const;
export const BLUR_PROPS: BlurViewProps = {
  intensity: BLUR_INTENSITY,
  blurMethod: 'dimezisBlurView' as const,
  tint: BLUR_TINT,
}

const blurTargetAtom = atom<View | null>(null);

export const useBlur = () => {
  const [blurTarget, setBlurTarget] = useAtom(blurTargetAtom);
  const blurTargetRef = useRef<View>(blurTarget);

  useEffect(() => { if (blurTarget) blurTargetRef.current = blurTarget }, [blurTarget])

  return { blurTargetRef, setBlurTarget };
};

export const BlurView = (props: BlurViewProps) => {
  const { blurTargetRef } = useBlur();
  console.log("BLUR VIEW", blurTargetRef);
  return <ExpoBlurView {...BLUR_PROPS} {...props} blurTarget={blurTargetRef} />;
}

export const BlurTargetView = ({ children }: { children: React.ReactNode }) => {
  const { blurTargetRef, setBlurTarget } = useBlur();

  return (
    <ExpoBlurTargetView
      ref={blurTargetRef}
      onLayout={() => { setBlurTarget(blurTargetRef.current); }}
      style={{ flex: 1 }}
    >
      {children}
    </ExpoBlurTargetView>
  )
}