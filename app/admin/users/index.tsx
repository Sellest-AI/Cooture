import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { router } from "expo-router";
import { Platform } from "react-native";

export default function Screen() {
  return (
    <SafeScrollView
      contentContainerStyle={{
        paddingTop: Platform.OS !== 'ios' ? 12 : 0,
        paddingHorizontal: 12,
        paddingBottom: TOTAL_TABS_SPACE
      }}
      edges={{ bottom: 'android' }}
    >
      <ModalHeader
        title="Users"
        onBack={router.canGoBack() ? router.back : undefined}
      />
    </SafeScrollView>
  )
}