import { useRouter } from "@/hooks";
import { api, useAction, useQuery, useQueryCached } from "@/lib/convex/client";
import { compressImage } from "@/lib/image/client/editing";
import { Block } from "@ui/block";
import { ButtonSlider } from "@ui/button.slider";
import { CloudUpload, Credits, RefreshCcw } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { launchImageLibraryAsync } from "expo-image-picker";
import { MotiView } from "moti";
import { useState } from "react";
import { View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

type ImagePickerProps = {
  onImagePicked: (uri: string | null) => void;
  style?: ViewStyle;
}
const ImagePicker = ({ onImagePicked, style }: ImagePickerProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
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
        onImagePicked(result.assets[0].uri);
      }
      if (result.canceled) {
        setImageUri(null);
        onImagePicked(null);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  if (!imageUri)
    return <MotiView style={{
      flex: 1,
      ...style,
    }}>
      <Pressable onPress={handlePickImage} style={{
        flex: 1,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: Colors.blur.dark,
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28,
      }}>
        <CloudUpload
          size={48}
          color={Colors.neutral[400]}
        />
        <Text.Base
          color={Colors.neutral[50]}
          weight={500}
        >
          Upload Image
        </Text.Base>
      </Pressable>
    </MotiView>

  return (
    <View style={{ flex: 1, ...style }}>
      <Image
        style={{ width: '100%', height: '100%', borderRadius: 28 }}
        source={{ uri: imageUri }}
      />
      <Pressable
        onPress={handlePickImage}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        <Block variant="blur" style={{
          padding: 12
        }}>
          <RefreshCcw size={20} color={Colors.neutral[400]} />
        </Block>
      </Pressable>
    </View>
  )
}

const Cost = ({ cost }: { cost?: number | null }) => {
  return (
    <View style={{
      gap: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    }}>
      {cost && <Text.Sm
        style={{
          textAlign: 'center',
          maxWidth: 172,
        }}
        color={Colors.neutral[400]}
      >
        Your preset will cost
      </Text.Sm>}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Credits size={12} />
        <Text.Base
          color={Colors.primary[200]} weight={600}
          style={{ marginLeft: 2 }}
        >
          {cost}
        </Text.Base>
      </View>
    </View>
  )
}

export default function Screen() {
  const { push } = useRouter();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { action: createPreset } = useAction(api.router.presets.createOne.authed);
  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: 'PRESET_CREATION_COST' });
  const { data: canPay } = useQuery(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text.Sm color={Colors.secondary[500]} style={{ marginBottom: 8, textAlign: 'right', marginRight: 8 }}>
        Cannot be changed later, so choose wisely!
      </Text.Sm>
      <TextInput
        value={name}
        onChangeText={(p) => setName(p)}
        placeholder="Preset Name"
      />
      <ImagePicker
        onImagePicked={(uri) => setImageUri(uri)}
        style={{ marginBottom: 12, marginTop: 8 }}
      />
      <ButtonSlider
        disabled={!imageUri || name.length < 3 || !cost || !canPay}
        onComplete={async () => {
          if (!imageUri || name.length < 3 || !cost || !canPay) return false;

          const compressedImage = await compressImage(imageUri);
          const presetId = await createPreset({
            name,
            base64: await compressedImage.toBase64(),
          });

          if (!presetId) return false;

          push(ROUTES.PRESETS.CREATE.THUMBNAIL, { params: { presetId } });
          return true; // Navigating away
        }}
      >
        Generate preset
      </ButtonSlider>
      <Cost cost={cost} />
    </View>
  )
}