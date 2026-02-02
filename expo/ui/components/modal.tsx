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
    type?: 'default' | 'alt';
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
      backdropColor="rgba(0,0,0,0.8)"
      statusBarTranslucent={true}
    >
      <Animated.View style={{
        backgroundColor: "rgba(0,0,0,0.8)",
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
            paddingHorizontal: 12,
            ...style,
            paddingBottom: 0,
          }}
        >
          <FinalView showsVerticalScrollIndicator={false}>
            {header && <ModalHeader
              type={header.type}
              style={{ marginTop: 16 }}
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
  subtitle?: string;
  onBack?: () => void;
  style?: ViewStyle;
  type?: 'default' | 'alt';
  size?: 'big' | 'normal';
  endContent?: ReactNode;
}
export const ModalHeader = ({ title, onBack, style, subtitle, type, size, endContent }: ModalHeaderProps) => {
  const isAlt = type === 'alt';
  const isBig = size === 'big';

  const Title = isBig ? Text.H1 : Text.H3;

  const justify = onBack && !endContent ? 'center' :
    endContent ? 'flex-start' : 'center';

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
          color={isAlt ? Colors.primary[200] : Colors.foreground}
          style={{
            textAlign: 'center',
            maxWidth: "60%",
            marginTop: isBig ? 3 : (isAlt ? 6 : 2)
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