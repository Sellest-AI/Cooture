import { ROUTES, useRoute } from "@/hooks";
import { useItem } from "@/modules/items/_hooks/useItem";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { Stack } from "expo-router";

export default function Layout() {
  const { reset: resetOutfit } = useOutfit.New();
  const { reset: resetItem } = useItem.Create();
  useRoute(ROUTES.OUTFIT.NEW, {
    resetFnc: () => {
      resetOutfit();
      resetItem();
    }
  })

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
      <Stack.Screen name="browser" />
      <Stack.Screen name="index" />
      <Stack.Screen name="recap" />
    </Stack>
  )
}