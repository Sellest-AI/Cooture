import { useRouter } from "@/hooks";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Stepper } from "@ui/stepper";
import { router, Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { Colors } from "theme";

export default function Layout() {
  const { setOutfitId, reset } = usePhotoshoot.New();
  useRouter('/photoshoot/create', {
    resetFnc: reset,
    onInit: ({ outfitId }) => { if (outfitId) setOutfitId(outfitId) }
  });

  const pathname = usePathname();
  const step = pathname.includes('recap') ? 2 : 1;

  const title = step === 1 ? "Preset" : "Recap";
  const subtitle = step === 1 ?
    "Select an environment and we will generate up to 4 images of you with different poses in the same environment." :
    "Make sure your details are correct.";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView style={{ marginBottom: 4, padding: 12 }}>
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
      </SafeAreaView>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            width: '100%',
            flex: 1,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="recap" />
      </Stack>
    </View>
  )
}