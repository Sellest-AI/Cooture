import { useRouter } from "@/hooks";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { Stepper } from "@ui/stepper";
import { Text } from "@ui/text";
import { router, Slot, usePathname } from "expo-router";
import { MotiView } from "moti";
import { View } from "react-native";
import { Colors } from "theme";

export default function Layout() {
  const { setOutfitId, setPresetId, reset, preset } = usePhotoshoot.New();
  useRouter('/photoshoot/create', {
    resetFnc: reset,
    onInit: ({ outfitId, presetId }) => {
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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ParallaxScrollView
        locked={step > 1 ? false : true}
        headerBackground={step > 1 ? <Image
          source={preset?.cover?.url}
          style={{ flex: 1, opacity: 0.3 }}
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
            {(preset && step > 1) && <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 8,
              marginTop: 96
            }}
            >
              <Text.Base color={Colors.neutral[400]} weight={600}>Preset</Text.Base>
              <Text.H4 color={Colors.foreground}>{preset.name}</Text.H4>
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
    </View>
  )
}