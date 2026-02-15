import { SavedPosts } from "@/modules/collection/saved-posts";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { router } from "expo-router";

export default function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ModalHeader
        onBack={router.canGoBack() ? router.back : undefined}
        title="Saved Posts"
        style={{
          paddingTop: 12,
          paddingHorizontal: 12,
        }}
      />
      <SavedPosts
        itemWidth="100%"
        style={{ flex: 1, paddingBottom: TOTAL_TABS_SPACE }}
        direction="vertical"
        numColumns={2}
        initialNumItems={12}
      />
    </SafeAreaView>
  )
}