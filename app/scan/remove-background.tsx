import { useScan } from "@/modules/scan";
import { Block } from "@ui/block";
import { Loader } from "@ui/icons";
import { Image } from "@ui/image";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function RemoveBackgroundScreen() {
  const { replace } = useRouter();
  const { imageScanned } = useScan();
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

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
    setTimeout(() => {
      replace({
        pathname: ROUTES.ITEM.PATH,
        params: { id: 'XXX' }
      })
    }, 3000)
  }, [replace])

  if (!imageScanned) {
    // replace(ROUTES.SCAN);
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Image
        blurRadius={24}
        source={{ uri: imageScanned }}
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
              source={{ uri: imageScanned }}
              style={{
                aspectRatio: 3 / 4,
                width: '100%'
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
          <Text.Base color={Colors.neutral[50]}>
            Removing background...
          </Text.Base>
        </Block>
      </SafeAreaView>
    </View>
  );
}