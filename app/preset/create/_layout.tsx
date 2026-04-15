import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Stepper } from "@ui/stepper";
import { router, Stack, usePathname } from "expo-router";
import { Platform, View } from "react-native";
import { Colors } from "theme";

export default function Layout() {
  const path = usePathname();
  const step = path.includes('disclaimer') ? 1 :
    path.includes('thumbnail') ? 3 : 2;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingBottom: (Platform.OS !== 'ios' && step > 1) ? 8 : 0
      }}
      edges={{ bottom: step > 1 ? 'android' : 'off' }}
    >
      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        <ModalHeader
          title="New Preset"
          subtitle="Turn any image into a copiable preset"
          style={{ marginBottom: 8 }}
          onBack={step < 3 ? () => {
            if (router.canGoBack()) router.back()
            else router.dismissTo('/')
          } : undefined}
        />
        <Stepper
          value={step}
          style={{
            width: 280,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 12
          }}
        />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right"
        }}
      >
        <Stack.Screen name="disclaimer" />
        <Stack.Screen name="new" />
        <Stack.Screen name="thumbnail" />
      </Stack>
    </SafeAreaView>
  )
}