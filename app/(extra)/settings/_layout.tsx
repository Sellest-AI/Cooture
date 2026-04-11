import { Stack } from "expo-router";
import { Platform } from "react-native";
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
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="blocked-users"
      />
      <Stack.Screen
        name="delete-account"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents:
            Platform.OS === 'android' ? [0.57] : "fitToContents"
        }}
      />
    </Stack>
  )
}