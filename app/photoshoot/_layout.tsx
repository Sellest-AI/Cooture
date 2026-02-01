import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          width: '100%',
          flex: 1,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="generations/[id]" />
    </Stack>
  )
}