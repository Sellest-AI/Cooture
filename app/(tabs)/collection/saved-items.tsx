import { SavedItems } from "@/modules/collection/saved-items";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { router } from "expo-router";
import { Platform } from "react-native";

export default function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ bottom: 'android' }}>
      <ModalHeader
        onBack={router.canGoBack() ? router.back : undefined}
        title="Saved Items"
        style={{
          paddingTop: Platform.OS !== 'ios' ? 8 : 0,
          paddingHorizontal: 12,
        }}
      />
      <SavedItems
        itemWidth={96}
        style={{ flex: 1, paddingBottom: TOTAL_TABS_SPACE }}
        direction="vertical"
        numColumns={2}
        initialNumItems={12}
      />
    </SafeAreaView>
  )
}
