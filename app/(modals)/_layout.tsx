import { SafeAreaView } from "@ui/safe-area-view";
import { Slot, Stack } from "expo-router";
import { Dimensions } from "react-native";
import { Colors } from "theme";

export default function ModalsLayout() {
  const isFullScreen = Dimensions.get('window').height === Dimensions.get('screen').height;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        borderTopLeftRadius: isFullScreen ? 0 : 28,
        borderTopRightRadius: isFullScreen ? 0 : 28,
        borderTopColor: Colors.blur.dark,
        borderTopWidth: 1,
        overflow: 'hidden',
      }}
      edges={{ top: 'off', bottom: 'android' }}
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