import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal as NativeModal, Pressable, ScrollView, View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Block } from './block';
import { BLUR_PROPS, BlurView } from './blur-view';
import { ArrowLeft } from './icons';
import { Text } from './text';

type Children = (actions: { next: () => void, back: () => void, close: () => void }) => ReactNode[] | ReactNode;

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  scrollable?: boolean;
  children: ReactNode | Children;
  style?: ViewStyle;
  header?: {
    title: string;
    showBackButton?: boolean;
  }
}

export type ModalProps = Omit<Props, 'children'>;

export const Modal = ({ children, open, onOpenChange, style, header, scrollable = true }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const stepsLengthRef = useRef<number>(0);

  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: open ? 1 : 0,
      delay: 100,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open, opacityAnim]);

  const closeAnimation = useCallback(() => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
    // small delay to allow animation
    setTimeout(() => onOpenChange?.(false), 100);
  }, [onOpenChange, opacityAnim]);

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

  const FinalView = scrollable ? ScrollView : View;

  return (
    <NativeModal
      transparent
      visible={open}
      onRequestClose={() => { if (onOpenChange) closeAnimation(); }}
      animationType="slide"
      backdropColor="rgba(0,0,0,0.6)"
    >
      <Animated.View style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        position: 'absolute',
        flex: 1,
        width: '100%',
        height: '100%',
        opacity: opacityAnim,
      }}>
        <BlurView
          {...BLUR_PROPS}
          intensity={80}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
      </Animated.View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Pressable
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          onPress={() => {
            if (onOpenChange) { closeAnimation(); }
          }}
        />
        <Block
          variant="blur"
          style={{
            width: '100%',
            maxWidth: 540,
            maxHeight: '95%',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderLeftWidth: 0,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            backgroundColor: Colors.blur.modal,
            ...style,
          }}
        >
          <FinalView style={{ padding: 12 }} showsVerticalScrollIndicator={false}>
            {header && <ModalHeader
              title={header.title}
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
          </FinalView>
        </Block>
      </View>
    </NativeModal>
  )
}

type ModalHeaderProps = {
  title: string;
  onBack?: () => void;
}
export const ModalHeader = ({ title, onBack }: ModalHeaderProps) => {
  return (
    <View style={{
      paddingHorizontal: 8,
      paddingTop: 4,
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'center'
    }}>
      {onBack && <Pressable
        onPress={() => onBack?.()}
        style={{ position: 'absolute', left: 4, bottom: -4, padding: 4 }}
      >
        <ArrowLeft color={Colors.foreground} />
      </Pressable>}
      <Text.H4
        color={Colors.foreground}
        style={{ textAlign: 'center' }}
      >
        {title}
      </Text.H4>
    </View>
  )
}