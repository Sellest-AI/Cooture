import { CameraPermission } from "@/modules/camera/camera-permission";
import { useScan } from "@/modules/scan";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { FlashList } from "@ui/flat-list";
import { Col, Grid } from "@ui/grid";
import { Check, ImageUp, X } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Asset, getAlbumsAsync, getAssetsAsync, requestPermissionsAsync } from "expo-media-library";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const COLUMNS = 3;

const MediaList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  async function getAlbums() {
    const { status } = await requestPermissionsAsync();
    if (status !== 'granted') return;

    const fetchedAlbums = await getAlbumsAsync({
      includeSmartAlbums: true,
    });

    const images = await Promise.all(fetchedAlbums.map((album) => {
      return getAssetsAsync({
        album: album.id,
        mediaType: ['photo'],
        sortBy: 'creationTime',
        first: 20,
      });
    }))

    const imagesFlat = images.map((res) => res.assets).flat()
      // remove duplicates from multiple albums
      .filter((a, i, arr) => arr.findIndex((asset) => asset.uri === a.uri) === i)
      .sort((a, b) => b.creationTime - a.creationTime)

    const sliceIndex = Math.min(12 * COLUMNS, Math.max(COLUMNS * 2,
      imagesFlat.length - (imagesFlat.length % COLUMNS)));

    setAssets(imagesFlat.slice(0, sliceIndex));
  }

  useEffect(() => { getAlbums() }, [])

  return (
    <FlashList
      data={assets}
      ListEmptyComponent={<Grid style={{
        height: Dimensions.get('screen').width / (COLUMNS / 2),
        gap: 4
      }}>
        <Col style={{ gap: 4 }}>
          <Skeleton style={{ width: '100%', aspectRatio: 1 }} />
          <Skeleton style={{ width: '100%', aspectRatio: 1 }} />
        </Col>
        <Col style={{ gap: 4 }}>
          <Skeleton style={{ width: '100%', aspectRatio: 1 }} />
          <Skeleton style={{ width: '100%', aspectRatio: 1 }} />
        </Col>
        <Col style={{ gap: 4 }}>
          <Skeleton style={{ width: '100%', aspectRatio: 1 }} />
        </Col>
      </Grid>}
      numColumns={COLUMNS}
      style={{ marginHorizontal: 6 }}
      renderItem={({ item, index }) => {
        const remainingSlots = assets.length % COLUMNS === 0 ? 0 : (COLUMNS - (assets.length % COLUMNS));
        console.log(remainingSlots);
        const hasBorderBottomLeftRadius = index === assets.length - (COLUMNS - remainingSlots);

        return (
          <View style={{
            width: '100%',
            aspectRatio: 1,
            padding: 2,
          }}>
            <Image
              source={{ uri: item.uri }}
              style={{
                flex: 1,
                backgroundColor: Colors.blur.dark,
                borderTopLeftRadius: index === 0 ? 20 : 0,
                borderTopRightRadius: index === COLUMNS - 1 ? 20 : 0,
                borderBottomRightRadius: index === assets.length - 1 ? 20 : 0,
                borderBottomLeftRadius: hasBorderBottomLeftRadius ? 20 : 0,
              }}
            />
          </View>
        )
      }}
    />
  )
}

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
      await requestPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
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
    <ParallaxScrollView
      // ref={ }
      style={{
        flex: 1,
        backgroundColor: 'rgb(0,0,0)',
      }}
      headerBackground={
        <View style={{
          height: Dimensions.get('window').height - 282,
        }}>
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
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        </View>
      }
      contentNegativeSpace={64}
      headerContent={< View style={{
        height: Dimensions.get('window').height - 282,
      }}>
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 1)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 150
          }}
        />
        <View
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
        </View>
      </View>}
    >
      <View
        style={{
          gap: 16,
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 16,
          alignSelf: 'center',
          marginBottom: 28,
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
          variant="primary"
          style={{ padding: 4 }}
          onPress={handleCapture}
        >
          <Check size={24} color={Colors.primary[900]} />
        </Button>
      </View>
      <SafeAreaView edges={{ top: 'off' }}>
        <MediaList />
        <Button
          startIcon={ImageUp}
          variant="blur"
          onPress={handlePickImage}
          style={{ marginTop: 12, marginHorizontal: 12 }}
        >
          Open Camera Roll
        </Button>
      </SafeAreaView>
    </ParallaxScrollView>);
}