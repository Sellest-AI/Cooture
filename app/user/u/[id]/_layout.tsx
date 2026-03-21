import { useRoute } from "@/hooks";
import { Id } from "@/lib/convex/client";
import { ProfilePageContext } from "@/modules/profiles/page";
import { Stack } from "expo-router";
import { Colors } from "theme";

export default function Layout() {
  const { id } = useRoute.Params<{ id: Id<'users'> }>();

  return (
    <ProfilePageContext.Provider value={{ userId: id }}>

      <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="followers" />
        <Stack.Screen name="following" />
      </Stack>
    </ProfilePageContext.Provider>
  )
}