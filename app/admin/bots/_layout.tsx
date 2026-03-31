import { useAccount } from "@/lib/convex/auth";
import { Redirect, Slot, Stack } from "expo-router";
import { Platform } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Layout() {
  const { isAdmin } = useAccount.Admin();

  if (!isAdmin) return (
    <Redirect href={ROUTES.TABS.FEED} />
  )

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