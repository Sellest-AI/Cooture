import "@/global.css";
import { Providers } from '@/providers';
import { Slot, Stack } from 'expo-router';
import { View } from "react-native";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'profile',
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
          <Slot />
        </Stack>
      </View>
    </Providers>
  );
}
