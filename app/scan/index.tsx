import { useScan } from "@/modules/scan";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Check, ImageUp, X } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function ScanScreen() {
  const { push, dismiss, canDismiss } = useRouter();
  const { setImageScanned } = useScan();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setImageScanned(photo.uri);
        push('/scan/remove-background')
      }
    } catch (error) {
      console.error('Failed to capture image:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageScanned(result.assets[0].uri);
        push('/scan/remove-background');
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
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
        <Block
          variant="blur"
          style={{ borderRadius: 28, padding: 16, paddingTop: 20 }}
        >
          <Text.H4 style={{ textAlign: 'center', marginBottom: 8 }} color={Colors.neutral[50]}>
            Camera Permission Required
          </Text.H4>
          <Text.Base style={{ textAlign: 'center', marginBottom: 20 }} color={Colors.neutral[400]}>
            We need your permission to show the camera
          </Text.Base>
          <Button
            onPress={requestPermission}
            variant="primary"
          >
            Grant Permission
          </Button>
        </Block>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 150
        }}
      />
      <SafeAreaView style={{
        position: 'absolute',
        top: 24,
        alignSelf: 'center',
      }}>
        <Block variant="blur" style={{ alignSelf: 'center', borderRadius: 999 }}>
          <Text.Base color={Colors.neutral[50]}
            style={{ textAlign: 'center', paddingHorizontal: 24, paddingVertical: 12 }}
            weight={600}
          >
            Scan your item
          </Text.Base>
        </Block>
        <Block variant="blur" style={{ maxWidth: 220, borderRadius: 999, marginTop: 12 }}>
          <Text.Sm color={Colors.neutral[200]}
            style={{ textAlign: 'center', paddingHorizontal: 8, paddingVertical: 12 }}
          >
            The background will be removed automatically in the next step
          </Text.Sm>
        </Block>
      </SafeAreaView>
      <SafeAreaView
        style={{
          position: 'absolute',
          bottom: 24,
          gap: 16,
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 16,
          alignSelf: 'center',
        }}
      >
        <Button
          size="rounded"
          variant="blur"
          style={{ padding: 4 }}
          onPress={() => {
            if (canDismiss()) { dismiss(1) }
            else push(ROUTES.TABS.NEW)
          }}
        >
          <X color={Colors.foreground} size={24} />
        </Button>
        <Button
          size="rounded"
          variant="blur"
          style={{ padding: 4 }}
          onPress={handlePickImage}
        >
          <ImageUp color={Colors.foreground} size={24} />
        </Button>
        <Button
          size="rounded"
          variant="primary"
          style={{ padding: 4 }}
          onPress={handleCapture}
        >
          <Check size={24} color={Colors.primary[900]} />
        </Button>
      </SafeAreaView>
    </View>
  );
}