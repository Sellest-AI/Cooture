import { SafeAreaView } from "@ui/safe-area-view";
import { Slot, Stack } from "expo-router";
import { Colors } from "theme";

export default function ModalsLayout() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopColor: Colors.blur.dark,
        borderTopWidth: 1,
        overflow: 'hidden',
      }}
      edges={{ top: 'off' }}
    >
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
        <Slot />
      </Stack>
    </SafeAreaView>
  )
}