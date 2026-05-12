import { Image } from "@ui/image";
import { Text } from "@ui/text";
import { CameraView } from "expo-camera";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { Colors } from "theme";
import { CameraPermission } from "../camera/camera-permission";
import { CaptureButtons } from "../camera/capture-buttons";
import { GoodBadPictures } from "../camera/good-bad-pictures";

type Props = {
  imageUri?: string;
  onCapture?: (photoUri: string) => (void | Promise<void>);
  guideline?: 'default' | 'smile' | 'side';
  examples?: {
    hint?: string,
    good: ComponentProps<typeof GoodBadPictures>['goodPicture'];
    bad: ComponentProps<typeof GoodBadPictures>['badPictures'];
  }
}

export const UpdatePortraits = ({ imageUri, onCapture, examples, guideline = 'default' }: Props) => {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showCamera, setShowCamera] = useState(imageUri ? false : true);
  const [internalImageUri, setInternalImageUri] = useState<string | undefined>(imageUri);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Only update internal state if not currently processing
    if (!isProcessingRef.current) {
      setInternalImageUri(imageUri);
      setShowCamera(!imageUri);
    }
  }, [imageUri])

  if (!hasPermission) {
    return <CameraPermission onSuccess={() => setHasPermission(true)} />
  }

  const scale = Platform.OS === 'android' ? 1 : 1.4;

  return (
    <View style={{
      flex: 1,
    }}>
      {examples?.hint && <Text.Base
        color={Colors.neutral[50]}
        weight={600}
        textBreakStrategy="balanced"
        style={{
          marginHorizontal: 'auto',
          textAlign: 'center',
          maxWidth: '80%',
        }}>
        {examples.hint}
      </Text.Base>}
      {(examples?.bad && examples?.good) && <GoodBadPictures
        style={{ marginTop: 16, flex: 0 }}
        badPictures={examples.bad}
        goodPicture={examples.good}
      />}
      <View style={{ marginTop: 24, flex: 1 }}>
        <View style={{
          marginHorizontal: 'auto',
        }}>
          <View style={{
            width: '100%',
            aspectRatio: 3 / 4,
            borderColor: Colors.blur.medium,
            borderWidth: 1,
            borderRadius: 64,
            padding: 12,
          }}>
            <View style={{
              backgroundColor: Colors.blur.dark,
              flex: 1,
              width: '100%',
              borderRadius: 52,
              overflow: 'hidden',
            }}>
              {showCamera && <CameraView
                ref={cameraRef}
                style={{
                  flex: 1,
                  transform: [{ scale }]
                }}
                mirror={true}
                animateShutter={false}
                facing="front"
                flash="off"
              />}
              {(internalImageUri && !showCamera) && <Image
                cachePolicy="none"
                source={{ uri: internalImageUri }}
                style={{ flex: 1, position: 'absolute', inset: 0 }}
              />}
            </View>
            <View
              style={{
                width: '55%',
                aspectRatio: 3 / 4,
                position: 'absolute',
                top: '20%',
                alignSelf: 'center',
                borderRadius: 999,
                borderBottomRightRadius: 512,
                borderBottomLeftRadius: 512,
                borderWidth: 3,
                borderColor: 'white',
                borderStyle: 'dashed',
                opacity: 0.5
              }}
            >
              {guideline === 'smile' && <View style={{
                position: 'absolute',
                alignSelf: 'center',
                width: '35%',
                height: 32,
                borderWidth: 3,
                borderColor: 'white',
                borderRadius: 256,
                borderBottomLeftRadius: 999,
                borderBottomRightRadius: 999,
                bottom: '12%'
              }} />}
              {guideline === 'side' && <View style={{
                position: 'absolute',
                width: '25%',
                height: 8,
                borderWidth: 3,
                borderColor: 'white',
                borderRadius: 4,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                bottom: '17%',
                right: '4%'
              }} />}
              {guideline === 'default' && <View style={{
                position: 'absolute',
                alignSelf: 'center',
                width: '25%',
                height: 8,
                borderWidth: 3,
                borderColor: 'white',
                borderRadius: 4,
                bottom: '17%',
              }} />}
            </View>
          </View>
          <CaptureButtons
            style={{
              position: 'absolute',
              padding: 0,
              bottom: -24,
              marginLeft: -12
            }}
            showBackButton={false}
            cameraRef={cameraRef}
            onDelete={!showCamera ? () => {
              setShowCamera(true);
              setInternalImageUri(undefined);
            } : undefined}
            onCapture={async (photo) => {
              try {
                isProcessingRef.current = true;

                const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');

                const imageWidth = photo.width;
                const imageHeight = photo.height;

                const cropWidth = Math.round(imageWidth / scale);
                const cropHeight = Math.round(imageHeight / scale);

                const originX = Math.round((imageWidth - cropWidth) / 2);
                const originY = Math.round((imageHeight - cropHeight) / 2);

                const manipulatedPhoto = await (await ImageManipulator.manipulate(photo.uri)
                  .crop({
                    originX: Math.max(0, originX),
                    originY: Math.max(0, originY),
                    width: cropWidth,
                    height: cropHeight,
                  })
                  .renderAsync())
                  .saveAsync({
                    format: SaveFormat.JPEG,
                    compress: 1,
                  });

                setInternalImageUri(manipulatedPhoto.uri);
                setShowCamera(false);
                await onCapture?.(manipulatedPhoto.uri);
              } finally {
                isProcessingRef.current = false;
              }
            }}
          />
        </View>
      </View>
    </View>
  )
}

