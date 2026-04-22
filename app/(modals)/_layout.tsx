import { SafeAreaView } from "@ui/safe-area-view";
import { Slot, Stack } from "expo-router";
import { Platform, View } from "react-native";
import { Colors } from "theme";

export default function ModalsLayout() {
  const isFullScreen = Platform.OS === 'web';

  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'android' }}
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        overflow: 'hidden',
      }}
    >
      <View style={{
        overflow: 'hidden',
        backgroundColor: 'transparent',
        borderTopWidth: isFullScreen ? 0 : 1,
        borderTopLeftRadius: isFullScreen ? 0 : 28,
        borderTopRightRadius: isFullScreen ? 0 : 28,
        borderBottomLeftRadius: isFullScreen ? 0 : Platform.OS === 'ios' ? 28 : 0,
        borderBottomRightRadius: isFullScreen ? 0 : Platform.OS === 'ios' ? 28 : 0,
        borderLeftWidth: Platform.OS === 'ios' ? 1 : 0,
        borderRightWidth: Platform.OS === 'ios' ? 1 : 0,
        borderBottomWidth: Platform.OS === 'ios' ? 1 : 0,
        borderColor: Colors.blur.dark,
        flex: 1,
      }}>
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
      </View>
    </SafeAreaView>
  )
}