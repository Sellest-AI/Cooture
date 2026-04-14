import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { router, Stack, usePathname } from "expo-router";
import { Platform } from "react-native";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileLayout() {
  const pathname = usePathname();
  const currentStep =
    pathname.includes('smile') ? 2 :
      pathname.includes('side') ? 3 : 1;

  const title = currentStep === 1 ? 'Front View' :
    currentStep === 2 ? 'Smile View' :
      currentStep === 3 ? 'Side View' : 'Update Portraits';

  const subtitle = currentStep === 1 ? 'Take a picture of your front face.' :
    currentStep === 2 ? 'Take a picture of you smiling.' :
      currentStep === 3 ? 'Take a picture of your side face.' : undefined;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'ios' ? 0 : 12,
        backgroundColor: Colors.background
      }}
      edges={{ bottom: Platform.OS === 'ios' ? 'off' : 'additive' }}
    >
      <ModalHeader
        title={title}
        subtitle={subtitle}
        onBack={router.canGoBack() ? router.back : undefined}
        type="alt"
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="side" />
        <Stack.Screen name="smile" />
      </Stack>
    </SafeAreaView>
  );
}
