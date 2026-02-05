import { CameraPermission } from "@/modules/camera/camera-permission";
import { useScan } from "@/modules/scan";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Check, ImageUp, X } from "@ui/icons";
import { LinearGradient } from "@ui/linear-gradient";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function ScanScreen() {
  const { setImageScanned } = useScan();
  const cameraRef = useRef<CameraView>(null);

  const [hasPermission, setHasPermission] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setImageScanned(photo.uri);
        router.push('/scan/remove-background')
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
        router.push('/scan/remove-background');
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  if (!hasPermission)
    return (
      <CameraPermission onSuccess={() => setHasPermission(true)} />
    )

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
      <SafeAreaView
        edges={{ bottom: 'off' }}
        style={{
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
            if (router.canGoBack()) { router.back() }
            else router.push(ROUTES.TABS.NEW)
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
    </View>);
}