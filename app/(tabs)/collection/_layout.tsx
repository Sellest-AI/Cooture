import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { Stack } from "expo-router";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileLayout() {
  return (
    <BlurTargetView blurKey={BlurKeys.COLLECTION}>
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
        <Stack.Screen name="saved-posts" />
        <Stack.Screen name="saved-outfits" />
      </Stack>
    </BlurTargetView>
  );
}
