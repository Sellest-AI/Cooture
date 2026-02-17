import { useRouter } from "@/hooks";
import { api, useAction } from "@/lib/convex/client";
import { compressImage } from "@/lib/image/client/editing";
import { Button } from "@ui/button";
import { ImageIcon } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { TextInput } from "@ui/text-input";
import { launchImageLibraryAsync } from "expo-image-picker";
import { useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";

export default function Screen() {
  const { push } = useRouter();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { action: createPreset } = useAction(api.router.presets.createOne.admin);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  return (
    <SafeAreaView style={{ padding: 12 }}>
      <ModalHeader
        title="New Preset"
      />
      <View style={{ flex: 1, marginBottom: 52 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Preset Name"
        />
      </View>
      {imageUri && <View style={{ marginTop: 12 }}>
        <Image
          style={{ width: '100%', height: 300, borderRadius: 16 }}
          source={{ uri: imageUri }}
        />
      </View>}
      <Button
        variant="blur"
        startIcon={ImageIcon}
        style={{ marginTop: 12 }}
        onPress={() => handlePickImage()}
      >
        Pick Image
      </Button>
      <Button
        style={{ marginTop: 24 }}
        variant="primary"
        onPress={async () => {
          if (!imageUri || name.length < 3) return;
          const compressedImage = await compressImage(imageUri);
          const presetId = await createPreset({
            name,
            base64: await compressedImage.toBase64(),
          })

          push(ROUTES.PHOTOSHOOT.NEW, {
            params: { presetId }
          })
        }}
      >
        Generate
      </Button>
    </SafeAreaView>
  )
}