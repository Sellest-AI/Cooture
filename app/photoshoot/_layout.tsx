import { Id } from "@/lib/convex/api";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Stepper } from "@ui/stepper";
import { router, Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function Layout() {
  const { outfitId } = useGlobalSearchParams<{ outfitId?: Id<'outfits'> }>();
  const { setOutfitId } = usePhotoshoot.New();
  useEffect(() => { setOutfitId(outfitId ?? null) }, [outfitId, setOutfitId]);

  const pathname = usePathname();
  const step = pathname.includes('new') ? 1 :
    pathname.includes('presets') ? 2 : 3;

  const title = step === 1 ? "Photoshoot" : "Style";
  const subtitle = step === 1 ? "Turn yourself into a professional model." :
    "Select an environment and we will generate 4 images of you with different poses in the same environment.";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {step < 3 && <SafeAreaView style={{ marginTop: 16, marginBottom: 16 }}>
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
      </SafeAreaView>}
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
        <Stack.Screen name="new" />
        <Stack.Screen name="presets" />
        <Stack.Screen name="generations/[id]" />
      </Stack>
    </View>
  )
}