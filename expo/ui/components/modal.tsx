import { AnimatePresence } from 'moti';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal as NativeModal, Pressable, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, GestureType } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { Colors } from 'theme';
import { Block } from './block';
import { BlurKeys } from './blur-view';
import { ArrowLeft } from './icons';
import { useSafeAreaInsets } from './safe-area-view';
import { Text } from './text';

type Children = (actions: { next: () => void, back: () => void, close: () => void }) => ReactNode[] | ReactNode;

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode | Children;
  style?: ViewStyle;
  header?: {
    style?: ViewStyle;
    title: string;
    showBackButton?: boolean;
    endContent?: ReactNode;
    type?: 'default' | 'alt';
  }
}

export type ModalProps = Omit<Props, 'children'>;

export const SlideToDismiss = ({
  children,
  onDismiss,
  threshold = 150,
  scrollY,
  simultaneousHandlers,
  canDismiss,
}: {
  children: ReactNode,
  onDismiss: () => void,
  threshold?: number,
  scrollY?: SharedValue<number>,
  simultaneousHandlers?: GestureType,
  canDismiss: SharedValue<boolean>,
}) => {
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      // If we aren't tapping explicitly on the grab handle, check scroll layout
      if (!canDismiss.value) {
        canDismiss.value = !scrollY || scrollY.value <= 1;
      }
    })
    .onChange((event) => {
      if (!canDismiss.value) return;

      // If we are at the default position and the user drags UP (negative changeY),
      // they are trying to scroll down the content. Disable dismiss for this gesture stroke.
      if (translateY.value === 0 && event.changeY < 0) {
        canDismiss.value = false;
        return;
      }

      translateY.value = Math.max(0, translateY.value + event.changeY);
    })
    .onEnd((event) => {
      if (!canDismiss.value) return;

      // Allow dismissing if translated past threshold OR if throwing it down hard enough
      if (translateY.value > threshold || event.velocityY > 1000) {
        // Animate the rest of the way out before unmounting so it doesn't freeze awkwardly
        translateY.value = withTiming(translateY.value + 500, { duration: 150 });
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200, mass: 0.5 });
      }
    });

  if (simultaneousHandlers) {
    gesture.simultaneousWithExternalGesture(simultaneousHandlers);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    justifyContent: 'flex-end',
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { pointerEvents: 'auto', justifyContent: 'flex-end' }]}>
        <Pressable style={{ position: 'absolute', inset: 0 }} onPress={() => onDismiss()} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export const Modal = ({ children, open, onOpenChange, style, header }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsLengthRef = useRef<number>(0);

  const scrollY = useSharedValue(0);
  const canDismiss = useSharedValue(false);
  const nativeScroll = Gesture.Native();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  const closeAnimation = useCallback(() => {
    if (onOpenChange) onOpenChange(false);
  }, [onOpenChange]);

  // navigation helpers that reference current steps length
  const next = useCallback(() => {
    const len = stepsLengthRef.current || 0;
    setCurrentStep((s) => {
      const nextIndex = s + 1;
      if (len && nextIndex >= len) {
        closeAnimation();
        return s;
      }
      return nextIndex;
    });
  }, [closeAnimation]);

  const back = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const { bottom } = useSafeAreaInsets();

  const paddingBottom = bottom;

  return (
    <NativeModal
      visible={open}
      onDismiss={() => { if (onOpenChange) closeAnimation(); }}
      animationType="slide"
      transparent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AnimatePresence>
          <SlideToDismiss
            onDismiss={() => { if (onOpenChange) closeAnimation(); }}
            scrollY={scrollY}
            simultaneousHandlers={nativeScroll}
            canDismiss={canDismiss}
          >
            <Block
              blurKey={BlurKeys.FEED}
              variant="blur"
              style={{
                width: '100%',
                maxWidth: 540,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderLeftWidth: 0,
                overflow: 'hidden',
                backgroundColor: Colors.blur.darkest,
                paddingHorizontal: 12,
                pointerEvents: 'auto',
                ...style,
                paddingBottom: 0,
                alignSelf: 'flex-end'
              }}
            >
              <GestureDetector gesture={Gesture.Tap().onBegin(() => {
                'worklet';
                canDismiss.value = true;
              }).onEnd(() => {
                'worklet';
                canDismiss.value = scrollY ? scrollY.value <= 1 : true;
              }).simultaneousWithExternalGesture(nativeScroll)}>
                <Animated.View style={{ width: '100%', paddingVertical: 12, alignItems: 'center' }}>
                  <View
                    style={{ width: 56, height: 4, borderRadius: 2, backgroundColor: Colors.neutral[400] }}
                  />
                </Animated.View>
              </GestureDetector>
              <GestureDetector gesture={nativeScroll}>
                <Animated.ScrollView
                  showsVerticalScrollIndicator={false}
                  // 95% - Pan handler offset
                  style={{
                    maxHeight: (Dimensions.get('window').height * 0.95) - 24,
                  }}
                  // bottom
                  contentContainerStyle={{ paddingBottom }}
                  bounces={false}
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                >
                  {header && <ModalHeader
                    type={header.type}
                    style={{
                      marginTop: 10,
                      // Make sure to always have horizontal padding
                      paddingHorizontal: 12 - Number(style?.paddingHorizontal ?? 0),
                      ...header.style
                    }}
                    title={header.title}
                    endContent={header.endContent}
                    onBack={(header.showBackButton || currentStep > 0) ? () => {
                      back?.();
                      if (currentStep === 0 && onOpenChange) closeAnimation();
                    } : undefined}
                  />}

                  {/* handle children as array of steps, render-prop, or single node */}
                  {(() => {
                    // if children is a function, call it with actions
                    if (typeof children === 'function') {
                      const res = (children as Children)({ next, back, close: () => { if (onOpenChange) closeAnimation(); } });
                      if (Array.isArray(res)) {
                        stepsLengthRef.current = res.length;
                        return res[currentStep] ?? null;
                      }
                      stepsLengthRef.current = 0;
                      return res;
                    }

                    // if children is an array, treat as steps
                    if (Array.isArray(children)) {
                      const arr = children as ReactNode[];
                      stepsLengthRef.current = arr.length;
                      return arr[currentStep] ?? null;
                    }

                    stepsLengthRef.current = 0;
                    return children;
                  })()}
                </Animated.ScrollView>
              </GestureDetector>
            </Block>
          </SlideToDismiss>
        </AnimatePresence>
      </GestureHandlerRootView>
    </NativeModal>
  )
}

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  style?: ViewStyle;
  type?: 'default' | 'alt';
  size?: 'big' | 'normal';
  endContent?: ReactNode;
  align?: 'auto' | 'left';
}
export const ModalHeader = ({ title, onBack, style, subtitle, type, size, align, endContent }: ModalHeaderProps) => {
  const isAlt = type === 'alt';
  const isBig = size === 'big';

  const Title = isBig ? Text.H1 : Text.H3;

  const justify =
    align === 'left' ? 'flex-start' :
      onBack ? 'center' : endContent ? 'flex-start' : 'center';

  return (
    <View style={{
      marginTop: 4,
      marginBottom: 12,
      ...style
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: justify,
        gap: 0,
        minHeight: 40,
      }}>
        {onBack && <Pressable
          onPress={() => onBack?.()}
          style={{
            position: 'absolute',
            left: 0,
            top: isBig ? -2 : -4,
            // padding: 4,
          }}
        >
          <Block
            variant="blur"
            style={{
              borderRadius: 99,
              padding: 10,
            }}
          >
            <ArrowLeft color={Colors.foreground} />
          </Block>
        </Pressable>}
        <Title
          type={isAlt ? 'alt' : undefined}
          color={isAlt ? Colors.primary[500] : Colors.foreground}
          style={{
            textAlign: 'center',
            maxWidth: "60%",
            marginTop: isBig ? 3 : (isAlt ? 6 : 2),
          }}
        >
          {title}
        </Title>
        {endContent && <View style={{
          position: 'absolute',
          right: 0,
          top: isBig ? -2 : -4,
        }}>
          {endContent}
        </View>}
      </View>
      {subtitle && <Text.Base
        color={Colors.neutral[400]}
        weight={600}
        textBreakStrategy="balanced"
        style={{ textAlign: 'center', marginTop: 2, maxWidth: "70%", alignSelf: 'center' }}
      >
        {subtitle}
      </Text.Base>}
    </View >
  )
}