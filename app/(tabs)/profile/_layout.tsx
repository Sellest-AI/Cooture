import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { Stack } from "expo-router";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileLayout() {
  return (
    <BlurTargetView blurKey={BlurKeys.PROFILE}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </BlurTargetView>
  );
}
