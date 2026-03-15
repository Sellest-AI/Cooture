import { useRouter } from "@/hooks";
import { api, useAction, useQuery } from "@/lib/convex/client";
import { useUpload } from "@/lib/convex/upload";
import { addBase64Header } from "@/lib/image/client/base64";
import { compressImage } from "@/lib/image/client/editing";
import { useScan } from "@/modules/scan";
import { Block } from "@ui/block";
import { Loader } from "@ui/icons";
import { Image } from "@ui/image";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function RemoveBackgroundScreen() {
  const { replace } = useRouter();
  const { imageScanned } = useScan();
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  const { uploadImage } = useUpload();
  const triggeredAt = useRef<Date | null>(null);

  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [step, setStep] = useState<
    'compressing' | 'removing' | 'uploading' | 'analyzing'>
    ('removing');

  const { action: createItem } = useAction(api.router.items.createOne.authed);
  const { action: removeBackground } = useAction(api.llm.triggers.removeBackground.authed);

  const { data: image } = useQuery(api.router.storage.images.getLatest.authed);
  const { data: items } = useQuery(api.router.items.getFromUser.authed);

  // Check whenever create item is triggered
  useEffect(() => {
    if (step === 'analyzing') return;
    if (!image) return;
    if (!triggeredAt.current) return;
    if (image._creationTime < triggeredAt.current.getTime()) return;
    setDisplayImage(image.url);
    setStep('analyzing');
  }, [image, triggeredAt, step])

  // Check whenever create item is finished
  useEffect(() => {
    if (step !== 'analyzing') return;
    if (!triggeredAt.current) return;
    const recenItem = (items || [])?.find((item) => item._creationTime > triggeredAt.current!.getTime());
    if (recenItem) {
      replace(ROUTES.ITEM.PATH, {
        pathParams: { id: recenItem._id },
        redirectTo: ROUTES.SCAN,
      })
    }
  }, [triggeredAt, items, step, replace])

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
    if (triggeredAt.current !== null) return;
    triggeredAt.current = new Date();

    // Store original image for display
    setDisplayImage(imageScanned);

    (async () => {
      setStep('compressing');
      const compressed = await compressImage(imageScanned, {
        maxResolution: 2048,
        keepMimeType: false,
      })
      const base64 = addBase64Header(await compressed.toBase64(), 'webp');
      setDisplayImage(compressed.uri);

      setStep('removing');
      const { hasAlpha } = await removeBackground({ base64: base64, nextStep: 'CREATE_ITEM' });

      // If the image has an alpha channel, we can skip the background removal step and directly upload it
      if (hasAlpha) {
        setStep('uploading');
        const image = await uploadImage(compressed.uri);
        await createItem({ imageId: image._id });
      }
    })();
  }, [createItem, imageScanned, removeBackground, uploadImage])

  if (!imageScanned) {
    return <Redirect href={ROUTES.SCAN} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Image
        blurRadius={24}
        source={{ uri: displayImage ?? imageScanned }}
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
              source={{ uri: displayImage ?? imageScanned }}
              contentFit={displayImage ? 'contain' : 'cover'}
              style={{
                aspectRatio: 3 / 4,
                width: '100%',
                padding: step === 'analyzing' ? 32 : 0,
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
          {step === 'compressing' && <Text.Base color={Colors.neutral[50]}>
            Optimizing image...
          </Text.Base>}
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