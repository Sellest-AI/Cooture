import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Stepper } from "@ui/stepper";
import { Stack, usePathname } from "expo-router";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'front',
};

export default function ProfileLayout() {
  const pathname = usePathname();
  const currentStep =
    pathname.includes('front') ? 1 :
      pathname.includes('smile') ? 2 :
        pathname.includes('side') ? 3 : 0;

  const title = currentStep === 1 ? 'Front View' :
    currentStep === 2 ? 'Smile View' :
      currentStep === 3 ? 'Side View' : 'Update Portraits';

  const subtitle = currentStep === 1 ? 'Take a picture of your front face.' :
    currentStep === 2 ? 'Take a picture of you smiling.' :
      currentStep === 3 ? 'Take a picture of your side face.' : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ModalHeader
        style={{ marginTop: 20 }}
        title={title}
        subtitle={subtitle}
        type="alt"
      />
      <Stepper
        value={currentStep}
        style={{
          width: 280,
          alignSelf: 'center',
          marginTop: 12,
          marginBottom: 32
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right',
          presentation: 'pageSheet'
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="side" />
        <Stack.Screen name="smile" />
      </Stack>
    </SafeAreaView>
  );
}
