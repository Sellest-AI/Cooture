import { atom, useAtom } from "jotai";
import { AnimatePresence, SafeAreaView, View } from "moti";
import { useCallback, useEffect } from "react";
import { Platform, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Colors } from "theme";
import { BlurView } from "./blur-view";
import { LinearGradient } from "./linear-gradient";
import { Pressable } from "./pressable";
import { Text } from "./text";

type IconStyle = ViewStyle & { strokeWidth?: number }

type Toast = {
  key: string;
  icon?: React.ComponentType<{ size?: number, color?: string, style?: IconStyle }> | false;
  imageSrc?: string;
  title: string;
  description?: string;
  durationS?: number;
  type?: 'default' | 'success' | 'error';
  onPress?: () => void;
}

const toasts = atom<Toast[]>([]);

export const useToasts = () => {
  const [state, setState] = useAtom(toasts);
  const addToast = (toast: Omit<Toast, 'key'>) => {
    const key = `${Date.now()}`;
    setState((prev) => [...prev, { ...toast, key, durationS: toast.durationS ?? 10 }]);
    return key;
  };
  const removeToast = (key: string) => {
    setState((prev) => prev.filter((t) => t.key !== key));
  };

  return { toasts: state, addToast, removeToast };
}

type ToastComponentProps = {
  list?: { currentIndex: number, length: number },
  toast: Toast;
  onRemove: (key: string) => void;
  onPress?: () => void
}
const ToastComponent = ({ toast, onRemove, list, onPress }: ToastComponentProps) => {
  const index = list ? list.currentIndex : 0;
  const revertedIndex = list ? list.length - 1 - index : 0;
  const isLast = list ? index === list.length - 1 : true;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetY = useSharedValue(12 - (revertedIndex ?? 0) * 10);
  const scale = useSharedValue(1);

  useEffect(() => {
    const damping = Math.max(50, 100 - 20 * (revertedIndex ?? 0));
    offsetY.value = withSpring(12 - (revertedIndex ?? 0) * 10, { damping, stiffness: 100 });
  }, [revertedIndex, offsetY]);

  useEffect(() => {
    const damping = Math.max(30, 100 - 20 * (revertedIndex ?? 0));
    const stiffness = Math.max(200, 300 - 30 * (revertedIndex ?? 0));
    scale.value = withSpring(1 - (0.1 * (revertedIndex ?? 0)), { damping, stiffness });
  }, [isLast, revertedIndex, scale])

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 50) {
        translateX.value = withTiming(Math.sign(e.translationX) * 500, { duration: 300 });
        setTimeout(() => { scheduleOnRN(onRemove, toast.key); }, 150);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + offsetY.value },
      { scale: scale.value }
    ],
  }));

  const remove = useCallback(() => {
    // Don't remove if the toast is being swiped
    if (translateX.get() !== 0) return;
    // Animate out Y
    translateY.value = withTiming(-200, { duration: 300 },
      () => { scheduleOnRN(onRemove, toast.key); });
  }, [onRemove, toast.key, translateX, translateY]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (toast.durationS) {
      timeout = setTimeout(() => { remove(); }, toast.durationS * 1000);
    }
    return () => { if (timeout) clearTimeout(timeout); }
  }, [onRemove, remove, toast, translateX, translateY])

  const Icon = toast.icon;

  return <GestureDetector gesture={pan}>
    <SafeAreaView
      style={{
        position: 'absolute',
        alignItems: 'center',
        width: '100%',
      }}
      from={{ translateY: -200 }}
      animate={{ translateY: 0 }}
      exit={{ translateY: -200 }}
      exitTransition={{ delay: 300, duration: 200 }}
    >
      <Animated.View style={[animatedStyle]}>
        <Pressable
          animated={!!onPress}
          onPress={onPress ? () => {
            onPress();
            setTimeout(remove, 300);
          } : undefined}
          style={{
            alignSelf: 'center',
            overflow: 'hidden',
            borderColor: Colors.blur.medium,
            backgroundColor: 'transparent',
            borderRadius: 36,
            borderWidth: 1,
          }}>
          <BlurView
            intensity={40}
            style={{
              alignSelf: 'center',
              maxWidth: 332,
              backgroundColor: Platform.OS === 'android' ?
                Colors.blur.darkest : Colors.blur.dark,
              overflow: 'hidden',
              flexDirection: 'row',
              alignItems: 'center',
              gap: toast.description ? 16 : 12,
              padding: 12,
              paddingLeft: Icon ? 12 : 28,
              paddingRight: 28,
            }}
          >

            {toast.type !== 'default' && <LinearGradient
              colors={[toast.type === 'error' ? Colors.destructive[500] :
                toast.type === 'success' ? Colors.primary[500] : 'transparent',
                'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 200,
                opacity: 0.2
              }}
            />}
            {Icon && <View style={{
              padding: toast.description ? 14 : 2,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: toast.description ? 'rgba(255,255,255,0.1)' : 'transparent',
              overflow: 'hidden',
            }}>
              {toast.description && <View style={{ position: 'absolute', inset: 0 }}>
                <LinearGradient
                  colors={['rgb(0,0,0,0.2)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>}
              <Icon
                size={20}
                color={toast.type === 'error' ? Colors.destructive[500] :
                  toast.type === 'success' ? Colors.primary[500] : Colors.neutral[200]}
                style={{ strokeWidth: 2 }}
              />
            </View>}
            <View style={{ flexShrink: 1 }}>
              <Text.Base
                color={toast.type === 'error' ? Colors.destructive[500] :
                  toast.type === 'success' ? Colors.primary[500] : Colors.neutral[50]}
                weight={500}>
                {toast.title}
              </Text.Base>
              {toast.description && <Text.Sm
                color={toast.type === 'default' ? Colors.neutral[400] : Colors.neutral[200]}
                weight={500}
                style={{ marginTop: 6 }}
                numberOfLines={2}
              >
                {toast.description}
              </Text.Sm>}
            </View>
          </BlurView>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  </GestureDetector>;
}

export const ToastsProvider = ({ children }: { children: React.ReactNode }) => {
  const { toasts, removeToast } = useToasts();

  return (
    <>
      {children}
      <AnimatePresence>
        {toasts.map((toast, i, arr) => (
          <ToastComponent
            toast={toast}
            key={toast.key}
            onRemove={removeToast}
            list={{
              currentIndex: i,
              length: arr.length
            }}
          />
        ))}
      </AnimatePresence>
    </>
  )
}