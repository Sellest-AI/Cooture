import { Image } from "@ui/image";
import { Text } from "@ui/text";
import { CameraView } from "expo-camera";
import { ComponentProps, useRef, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";
import { CameraPermission } from "../camera/camera-permission";
import { CaptureButtons } from "../camera/capture-buttons";
import { GoodBadPictures } from "../camera/good-bad-pictures";

type Props = {
  imageUri?: string;
  onCapture?: (photoUri: string) => (void | Promise<void>);
  examples?: {
    hint?: string,
    good: ComponentProps<typeof GoodBadPictures>['goodPicture'];
    bad: ComponentProps<typeof GoodBadPictures>['badPictures'];
  }
}

export const UpdatePortraits = ({ imageUri, onCapture, examples }: Props) => {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState(false);

  if (!hasPermission) {
    return <CameraPermission onSuccess={() => setHasPermission(true)} />
  }

  return (
    <View style={{
      flex: 1,
    }}>
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        aspectRatio: 2 / 3,
        marginHorizontal: 'auto',
        marginBottom: 56,
      }}>
        <View style={{
          backgroundColor: Colors.blur.dark,
          flex: 1,
          width: '100%',
          borderBottomLeftRadius: 64,
          borderBottomRightRadius: 64,
          overflow: 'hidden',
        }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            mirror={true}
            animateShutter={false}
            facing="front"
            flash="off"
          />
          {imageUri && <Image
            source={imageUri}
            style={{ flex: 1, position: 'absolute', inset: 0 }}
          />}
        </View>
        <CaptureButtons
          style={{
            position: 'absolute',
            padding: 0,
            bottom: -28,
            marginLeft: -28
          }}
          showBackButton={false}
          cameraRef={cameraRef}
          onCapture={async (photo) => {
            await onCapture?.(photo.uri);
          }}
        />
      </View>
      {examples?.hint && <Text.Base
        color={Colors.neutral[400]}
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
        style={{ marginTop: 36 }}
        badPictures={examples.bad}
        goodPicture={examples.good}
      />}
    </View>
  )
}