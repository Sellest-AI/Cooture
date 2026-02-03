import { compressImage } from "@/lib/image/client/editing"
import { Button } from "@ui/button"
import { ArrowLeft, Camera, ImageIcon, X } from "@ui/icons"
import { CameraCapturedPicture, CameraView } from "expo-camera"
import { launchImageLibraryAsync } from "expo-image-picker"
import { router } from "expo-router"
import { View, ViewStyle } from "react-native"
import { ROUTES } from "routes"
import { Colors } from "theme"

type CameraCapturePictureExtended = Omit<CameraCapturedPicture, 'format' | 'base64'>
  & Awaited<ReturnType<typeof compressImage>> & { base64?: string | null | undefined }

type Props = {
  style?: ViewStyle;
  cameraRef: React.RefObject<CameraView | null>;
  onCapture: (photo: CameraCapturePictureExtended) => void;
  backButton?: "close" | "back";
  showBackButton?: boolean;
}

export const CaptureButtons = ({ style, cameraRef, onCapture, backButton = "close", showBackButton = true }: Props) => {
  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      const photoCompressed = await compressImage(photo.uri);
      await onCapture({ ...photo, ...photoCompressed, uri: photoCompressed.uri });
    } catch (error) {
      console.error('Failed to capture image:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      const photo = result.assets?.[0];
      if (!result.canceled && photo) {
        const photoCompressed = await compressImage(photo.uri);
        await onCapture({ ...photo, ...photoCompressed, uri: photoCompressed.uri });
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };


  return (
    <View
      style={{
        gap: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignSelf: 'center',
        ...style,
      }}
    >
      {showBackButton && <Button
        size="rounded"
        variant="blur"
        style={{ padding: 4 }}
        onPress={() => {
          if (router.canGoBack()) { router.back() }
          else router.push(ROUTES.PROFILE.PATH)
        }}
      >
        {backButton === "back" ? <ArrowLeft color={Colors.foreground} size={24} /> :
          <X color={Colors.foreground} size={24} />}
      </Button>}
      <Button
        size="rounded"
        variant="blur"
        style={{ padding: 12 }}
        onPress={handlePickImage}
      >
        <ImageIcon color={Colors.foreground} size={24} />
      </Button>
      <Button
        size="rounded"
        variant="primary"
        style={{ padding: 20 }}
        onPress={handleCapture}
      >
        <Camera size={28} color={Colors.primary[900]} />
      </Button>
    </View>
  )
}