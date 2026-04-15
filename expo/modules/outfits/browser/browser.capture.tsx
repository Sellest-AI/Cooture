import {
  Canvas,
  Rect,
  Image as SkiaImage,
  useImage
} from "@shopify/react-native-skia";
import { Button } from "@ui/button";
import { Modal, ModalHeader } from "@ui/modal";
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Focus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View, ViewStyle, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  captureRef: React.RefObject<ViewShot | null>;
  style?: ViewStyle;
  onCrop?: (image: { uri: string, width: number, height: number }) => void;
};

export const BrowserCapture = ({ style, captureRef, onCrop }: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const CANVAS_WIDTH = screenWidth - 24;
  const CANVAS_HEIGHT = 540;

  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Skia shared values for the selection rect
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const endX = useSharedValue(0);
  const endY = useSharedValue(0);
  const isSelecting = useSharedValue(false);

  const rectX = useDerivedValue(() =>
    Math.min(startX.value, endX.value)
  );
  const rectY = useDerivedValue(() =>
    Math.min(startY.value, endY.value)
  );
  const rectW = useDerivedValue(() =>
    Math.abs(endX.value - startX.value)
  );
  const rectH = useDerivedValue(() =>
    Math.abs(endY.value - startY.value)
  );

  const skiaImage = useImage(screenshotUri);

  const handleCapture = async () => {
    const _uri = await captureRef.current?.capture?.();
    if (_uri) {
      const uri = _uri.startsWith('file://') ? _uri : `file://${_uri}`;
      setScreenshotUri(uri);
      // Reset selection (50% of canvas size)
      startX.value = CANVAS_WIDTH * 0.10;
      startY.value = CANVAS_HEIGHT * 0.10;
      endX.value = CANVAS_WIDTH * 0.90;
      endY.value = CANVAS_HEIGHT * 0.90;
    }
  };

  const handleCrop = useCallback(async (rect: SelectionRect) => {
    if (!screenshotUri || rect.width < 10 || rect.height < 10 || !skiaImage) return;
    setIsCropping(true);
    try {
      const imageWidth = skiaImage.width();
      const imageHeight = skiaImage.height();

      const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      const imageRatio = imageWidth / imageHeight;

      let scale;
      let offsetX = 0;
      let offsetY = 0;

      // With "cover", the image scales to completely fill the canvas. 
      // The dimension that overflows is cropped, and it's centered by default.
      if (imageRatio > canvasRatio) {
        // Image is proportionally wider than the canvas. It scales by height, and the width overflows left and right.
        scale = CANVAS_HEIGHT / imageHeight;
        const displayedWidth = imageWidth * scale;
        offsetX = (displayedWidth - CANVAS_WIDTH) / 2;
      } else {
        // Image is proportionally taller than the canvas. It scales by width, and the height overflows top and bottom.
        scale = CANVAS_WIDTH / imageWidth;
        const displayedHeight = imageHeight * scale;
        offsetY = (displayedHeight - CANVAS_HEIGHT) / 2;
      }

      // Map canvas crop rect to actual image pixels and clamp them
      // We add the offset because the canvas starts "inside" the real image now
      const cropX = Math.max(0, (rect.x + offsetX) / scale);
      const cropY = Math.max(0, (rect.y + offsetY) / scale);
      const cropW = Math.min(imageWidth - cropX, rect.width / scale);
      const cropH = Math.min(imageHeight - cropY, rect.height / scale);

      const resize = cropW > cropH ?
        { width: Math.min(cropW, 1024) } : { height: Math.min(cropH, 1024) };

      const manipulator = ImageManipulator.manipulate(screenshotUri).crop({
        originX: cropX,
        originY: cropY,
        width: cropW,
        height: cropH,
      })
        .resize(resize);

      const result = await (await manipulator
        .renderAsync())
        .saveAsync({
          format: SaveFormat.JPEG,
          base64: false,
          compress: 1,
        });

      onCrop?.(result);
      setScreenshotUri(null);
    } finally {
      setIsCropping(false);
    }
  }, [screenshotUri, skiaImage, CANVAS_WIDTH, onCrop]);

  const confirmCrop = () => {
    handleCrop({
      x: rectX.value,
      y: rectY.value,
      width: rectW.value,
      height: rectH.value,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      startX.value = e.x;
      startY.value = e.y;
      endX.value = e.x;
      endY.value = e.y;
      isSelecting.value = true;
    })
    .onUpdate((e) => {
      endX.value = Math.max(0, Math.min(e.x, CANVAS_WIDTH));
      endY.value = Math.max(0, Math.min(e.y, CANVAS_HEIGHT));
    })
    .onEnd(() => {
      isSelecting.value = false;
    });

  const handleClose = () => {
    setScreenshotUri(null);
  };

  return (
    <>
      <Button
        variant="primary"
        style={{ ...style }}
        onPress={handleCapture}
        startIcon={Focus}
      >
        Extract
      </Button>

      <Modal open={!!screenshotUri} onOpenChange={handleClose}>
        <View style={{ flex: 1 }}>
          <ModalHeader
            title="Select Area"
            subtitle="Draw a rectangle over the area you want to crop"
            onBack={handleClose}
          />

          {/* Skia canvas: screenshot + dim overlay + selection cutout */}
          <GestureDetector gesture={panGesture}>
            <Canvas
              style={{
                marginTop: 4,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                borderRadius: 28,
                overflow: "hidden",
              }}
            >
              {/* Background screenshot */}
              {skiaImage && (
                <SkiaImage
                  image={skiaImage}
                  fit="cover"
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                />
              )}

              {/* Top */}
              <Rect x={0} y={0} width={screenWidth} height={rectY} color="rgba(0,0,0,0.55)" />
              {/* Bottom */}
              <Rect x={0} y={useDerivedValue(() => rectY.value + rectH.value)} width={screenWidth} height={useDerivedValue(() => CANVAS_HEIGHT - rectY.value - rectH.value)} color="rgba(0,0,0,0.55)" />
              {/* Left */}
              <Rect x={0} y={rectY} width={rectX} height={rectH} color="rgba(0,0,0,0.55)" />
              {/* Right */}
              <Rect x={useDerivedValue(() => rectX.value + rectW.value)} y={rectY} width={useDerivedValue(() => screenWidth - rectX.value - rectW.value)} height={rectH} color="rgba(0,0,0,0.55)" />

              {/* Selection border */}
              <Rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                color="white"
                style="stroke"
                strokeWidth={2}
              />
            </Canvas>
          </GestureDetector>

          <Button
            variant="primary"
            style={{ marginTop: 12, marginBottom: 8 }}
            onPress={confirmCrop}
            isLoading={isCropping}
            disabled={isCropping || rectW.value < 10}
          >
            Save Item
          </Button>
        </View>
      </Modal>
    </>
  );
};