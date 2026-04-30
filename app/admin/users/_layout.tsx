import { Slot, Stack } from "expo-router";
import { Colors } from "theme";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'simple_push',
      }}
    >
      <Slot />
    </Stack>
  )
}