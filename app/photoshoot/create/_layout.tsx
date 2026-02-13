import { useRoute } from "@/hooks";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Badge } from "@ui/badge";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Stepper } from "@ui/stepper";
import { Text } from "@ui/text";
import { router, Slot, usePathname } from "expo-router";
import { MotiView } from "moti";
import { View } from "react-native";
import { Colors } from "theme";

export default function Layout() {
  const { setOutfitId, setPresetId, reset, preset } = usePhotoshoot.New();
  useRoute('/photoshoot/create', {
    resetFnc: reset,
    onInit: ({ outfitId, presetId }) => {
      if (outfitId === null) setOutfitId(null);
      if (presetId === null) setPresetId(null);
      if (outfitId) setOutfitId(outfitId)
      if (presetId) setPresetId(presetId)
    }
  });

  const pathname = usePathname();
  const step = pathname.includes('recap') ? 2 : 1;

  const title = step === 1 ? "Preset" : "Recap";
  const subtitle = step === 1 ?
    "Select an environment and we will generate photos for you." :
    "Make sure the options are correct.";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={{ bottom: 'additive', top: 'off' }}
    >
      <ParallaxScrollView
        scrollKey={step}
        locked={step > 1 ? false : true}
        headerBackground={step > 1 ? <Image
          source={preset?.cover?.sizes.large.url}
          style={{ flex: 1, opacity: 0.2 }}
        /> : undefined}
        headerContent={
          <View style={{ marginBottom: 4, flex: 1 }}>
            <View style={{ padding: 12 }}>
              <ModalHeader
                title={title}
                subtitle={subtitle}
                type="alt"
                onBack={router.canGoBack() ? () => router.back() : undefined}
              />
              <Stepper
                style={{ width: "90%", maxWidth: 280, alignSelf: 'center', marginTop: 12, paddingBottom: 2 }}
                value={step}
              />

            </View>
            {(step > 1) && <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 8,
              marginTop: 32
            }}
            >
              <Badge
                source={preset?.cover?.sizes.small.url}
                style={{ width: 112, height: 112, marginBottom: 16 }}
              />
              <Text.Base color={Colors.neutral[400]} weight={600}>Preset</Text.Base>
              {!preset ? <Skeleton style={{ height: 20, width: 148, marginTop: 4 }} /> :
                <Text.H4 color={Colors.foreground}>{preset.name}</Text.H4>}
            </View>}
          </View>
        }
      >
        <MotiView
          style={{ flex: 1 }}
          animate={{ opacity: 1, translateY: 0 }}
          from={{ opacity: 0, translateY: 50 }}
          transition={{ duration: 500 }}
        >
          <Slot />
        </MotiView>
      </ParallaxScrollView>
    </SafeAreaView>
  )
}