import "@/global.css";
import { Providers } from '@/providers';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="example/modal" options={{ presentation: 'modal' }} />
      </Stack>
    </Providers>
  );
}
