import "@/global.css";
import { StreakProvider } from "@/modules/credits/streak-provider";
import { Providers } from '@/providers';
import { AuthProvider } from "@/providers/auth";
import { Slot, Stack } from 'expo-router';
import { View } from "react-native";
import { Colors } from "theme";

export default function RootLayout() {
  return (
    <Providers>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <StreakProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: 'simple_push',
                presentation: 'pageSheet'
              }}
            >
              <Slot />
              <Stack.Screen
                name="(modals)"
                options={{
                  presentation: 'formSheet',
                  sheetAllowedDetents: [0.93],
                  sheetInitialDetentIndex: 0,
                  sheetCornerRadius: 28,
                }}
              />
            </Stack>
          </StreakProvider>
        </View>
      </AuthProvider>
    </Providers>
  );
}
