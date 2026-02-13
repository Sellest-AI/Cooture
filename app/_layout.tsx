import "@/global.css";
import { useAccount } from "@/lib/convex/auth";
import { Providers } from '@/providers';
import { Redirect, Slot, Stack, usePathname } from 'expo-router';
import { ReactNode } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const Router = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAccount();
  const pathname = usePathname();

  if (!pathname.startsWith('/welcome'))
    if (!isAuthenticated) return <Redirect href={ROUTES.WELCOME.INDEX} />

  if (pathname.startsWith('/welcome'))
    if (isAuthenticated) return <Redirect href={ROUTES.TABS.FEED} />

  return children
}

export default function RootLayout() {
  return (
    <Providers>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <Router>
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
        </Router>
      </View>
    </Providers>
  );
}
