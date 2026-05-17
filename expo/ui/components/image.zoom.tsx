import React, { ComponentProps, useState } from "react";
import { Modal as NativeModal, Pressable as NativePressable } from 'react-native';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "theme";
import { Block } from "./block";
import { X } from "./icons";
import { Image } from "./image";
import { MotiView } from "./motion";
import { Pressable } from "./pressable";
import { SafeAreaView } from "./safe-area-view";
import { ZoomableImage } from "./zoomable-image";
import { ZoomableWrapper } from "./zoomable-wrapper";

export type Props = {
  children: (options: { onPress: () => void }) => React.ReactNode;
  source: ComponentProps<typeof ZoomableImage>['source'];
  imageAspectRatio?: number;
}

const CLOSE_THRESHOLD = 120; // px of downward drag to trigger close

export const FullScreenImageZoom = ({ children, source, imageAspectRatio }: Props) => {
  const [open, setOpen] = useState(false);

  const translateY = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const close = () => setOpen(false);

  const resetPosition = () => {
    "worklet";
    translateY.value = withSpring(0, { damping: 50, stiffness: 500 });
    scale.value = withSpring(1, { damping: 50, stiffness: 500 });
    backgroundOpacity.value = withSpring(1);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow downward drag
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        scale.value = 1 - e.translationY / (CLOSE_THRESHOLD * 4);
        // Fade background as user drags down
        backgroundOpacity.value = Math.max(
          0,
          1.3 - e.translationY / (CLOSE_THRESHOLD * 2)
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD || e.velocityY > 800) {
        // Animate translateY off the screen
        translateY.value = withSpring(400, { damping: 20, stiffness: 200 });
        backgroundOpacity.value = withSpring(0);
        scale.value = withSpring(0, { damping: 20, stiffness: 200 });
        runOnJS(close)();
      } else {
        resetPosition();
      }
    });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const handleOpen = () => {
    translateY.value = 0;
    backgroundOpacity.value = 1;
    scale.value = 1;
    setOpen(true);
  };

  return (
    <>
      {children({ onPress: handleOpen })}
      <NativeModal
        visible={open}
        onRequestClose={close}
        transparent={true}
        animationType="fade"
      >
        <Animated.View
          style={[
            {
              backgroundColor: 'rgba(0,0,0,0.95)',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            },
            animatedBackgroundStyle,
          ]}
        >
          <MotiView
            from={{ scale: 0.95, translateY: 20 }}
            animate={{ scale: 1, translateY: 0 }}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 12,
            }}
          >
            <NativePressable
              style={{
                inset: 0,
                position: 'absolute',
                flex: 1,
              }}
              onPress={close}
            >
              <></>
            </NativePressable>

            <SafeAreaView style={{ position: 'absolute', bottom: 12 }}>
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 100 }}
              >
                <Pressable onPress={close}>
                  <Block
                    variant="blur"
                    style={{ padding: 16, borderRadius: 999 }}
                  >
                    <X color={Colors.neutral[400]} />
                  </Block>
                </Pressable>
              </MotiView>
            </SafeAreaView>

            <GestureDetector gesture={panGesture}>
              <Animated.View style={animatedImageStyle}>
                <ZoomableWrapper>
                  <Image
                    source={source}
                    contentFit="contain"
                    style={{
                      width: '100%',
                      aspectRatio: imageAspectRatio || 1,
                      borderRadius: 8,
                    }}
                  />
                </ZoomableWrapper>
              </Animated.View>
            </GestureDetector>
          </MotiView>
        </Animated.View>
      </NativeModal>
    </>
  );
};