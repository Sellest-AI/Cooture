import { Slot, Stack } from "expo-router";
import { Platform } from "react-native";
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
      <Stack.Screen
        name="generate"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: Platform.OS === 'ios' ? 'fitToContents' : [0.93],
          sheetInitialDetentIndex: 0,
          sheetCornerRadius: 28,
        }}
      />
    </Stack>
  )
}