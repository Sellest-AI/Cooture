import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Image } from "@ui/image";
import { Text } from "@ui/text";
import { useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Linking, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Props = {
  style?: ViewStyle;
  onSuccess?: () => void;
}

export const CameraPermission = ({ style, onSuccess }: Props) => {
  const [init, setInit] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => { if (permission?.granted) { onSuccess?.() } }, [onSuccess, permission]);

  useEffect(() => {
    if (init) return;
    if (!permission) return;
    if (permission.granted) return;
    if (permission.canAskAgain) requestAnimationFrame(() => requestPermission());
    setInit(true);
  }, [init, permission, requestPermission])

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}>
        <Image
          contentFit="cover"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.2
          }}
          source={require('assets/backgrounds/dark-gradient.png')}
        />
        <View style={{ padding: 12 }}>
          <Block
            variant="blur"
            style={{ borderRadius: 28, padding: 16, paddingTop: 20 }}
          >
            <Text.H4 style={{ textAlign: 'center', marginBottom: 8 }} color={Colors.neutral[50]}>
              Camera Permission Required
            </Text.H4>
            <Text.Base style={{ textAlign: 'center', marginBottom: 20 }} color={Colors.neutral[400]}>
              Cooture uses the camera so you can scan items to create your outfits, take selfies for virtual photoshoots, and capture pictures to edit.
            </Text.Base>
            <Button
              onPress={async () => {
                if (!permission.canAskAgain) Linking.openSettings();
                else await requestPermission();
              }}
              variant="primary"
            >
              Grant Permission
            </Button>
          </Block>
        </View>
      </View>
    );
  }

  return null;
}