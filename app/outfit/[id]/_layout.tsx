import { Stack } from "expo-router";
import { Colors } from "theme";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
          width: '100%',
        },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}