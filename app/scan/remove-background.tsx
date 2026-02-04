import { api, useAction } from "@/lib/convex/client";
import { useUpload } from "@/lib/convex/upload";
import { useScan } from "@/modules/scan";
// import { removeBackground } from '@six33/react-native-bg-removal';
import { Block } from "@ui/block";
import { Loader } from "@ui/icons";
import { Image } from "@ui/image";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function RemoveBackgroundScreen() {
  const { imageScanned } = useScan();
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  const { uploadImage } = useUpload();
  const [isTriggered, setIsTriggered] = useState(false);

  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [step, setStep] = useState<'removing' | 'uploading' | 'analyzing'>('removing');

  const { action: createItem } = useAction(api.router.items.createOne.authed);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  useEffect(() => {
    if (!imageScanned) return;
    if (isTriggered) return;
    setIsTriggered(true);

    (async () => {
      // const trimmedImageURI = await removeBackground(imageScanned);
      // setFinalImage(trimmedImageURI);
      setStep('uploading');
      const image = await uploadImage(imageScanned);
      setFinalImage(image.url);
      setStep('analyzing');
      const item = await createItem({ imageId: image._id });
      router.replace(ROUTES.ITEM.ID(item));
    })();
  }, [createItem, imageScanned, isTriggered, uploadImage])

  if (!imageScanned) {
    return <Redirect href={ROUTES.SCAN} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Image
        blurRadius={24}
        source={{ uri: finalImage ?? imageScanned }}
        style={{
          opacity: 0.1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <SafeAreaView style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 32,
        maxWidth: 320,
        marginHorizontal: 'auto',
        flex: 1
      }}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 56,
        }}>
          <Animated.View
            style={{
              backgroundColor: Colors.background,
              borderRadius: 32,
              overflow: 'hidden',
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderColor: Colors.blur.medium,
              opacity: opacityAnim,
            }}
          >
            <Image
              source={{ uri: finalImage ?? imageScanned }}
              contentFit={finalImage ? 'contain' : 'cover'}
              style={{
                aspectRatio: 3 / 4,
                width: '100%',
                padding: finalImage ? 32 : 0,
              }}
            />
          </Animated.View>
        </View>
        <Block
          variant="blur"
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 12,
            paddingHorizontal: 24,
            borderRadius: 99,
            gap: 12
          }}
        >
          <Loader color={Colors.primary[500]} />
          {step === 'removing' && <Text.Base color={Colors.neutral[50]}>
            Removing background...
          </Text.Base>}
          {step === 'uploading' && <Text.Base color={Colors.neutral[50]}>
            Uploading image...
          </Text.Base>}
          {step === 'analyzing' && <Text.Base color={Colors.neutral[50]}>
            Analyzing item...
          </Text.Base>}
        </Block>
      </SafeAreaView>
    </View>
  );
}