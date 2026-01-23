import "@/global.css";
import { Providers } from '@/providers';
import { Stack } from 'expo-router';
import { View } from "react-native";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'welcome/step-1',
};

export default function RootLayout() {
  return (
    <Providers>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'simple_push',
            presentation: 'pageSheet'
          }}
        >
          <Stack.Screen name={'welcome'} />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </Providers>
  );
}
