import { SafeAreaView } from "@ui/safe-area-view";
import { Stack } from "expo-router";
import { Colors } from "theme";

export default function ModalsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
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
          name="pick-outfit"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.9],
            sheetInitialDetentIndex: 0,
            sheetCornerRadius: 28,
            contentStyle: {
              borderTopWidth: 2,
              borderTopColor: Colors.blur.medium
            }
          }}
        />
        <Stack.Screen
          name="new-outfit"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.9],
            sheetInitialDetentIndex: 0,
            sheetCornerRadius: 28,
            contentStyle: {
              borderTopWidth: 2,
              borderTopColor: Colors.blur.medium
            }
          }}
        />
        <Stack.Screen
          name="add-item"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.9],
            sheetInitialDetentIndex: 0,
            sheetCornerRadius: 28,
            contentStyle: {
              borderTopWidth: 2,
              borderTopColor: Colors.blur.medium
            }
          }}
        />
      </Stack>
    </SafeAreaView>
  )
}