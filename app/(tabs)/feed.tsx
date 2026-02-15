import { useFeed } from "@/modules/feed/_hooks";
import { GenerationPost } from "@/modules/feed/post.generation";
import { OutfitPost } from "@/modules/feed/post.outfit";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Post } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView, useSafeAreaInsets } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { Colors } from "theme";

export default function Screen() {
  const { feed, canLoadMore, updateSeed, isLoading, loadMore } = useFeed({ initialNumItems: 8 });
  const { top } = useSafeAreaInsets();

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'maximum' }} style={{ flex: 1 }}>
      <FlashList
        refreshing={isLoading}
        onRefresh={() => updateSeed()}
        onEndReached={() => loadMore(8)}
        data={(feed ?? [])}
        keyExtractor={(i) => i?._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TOTAL_TABS_SPACE,
          paddingTop: top,
        }}
        ListEmptyComponent={<>
          <Post.Skeleton style={{ marginHorizontal: 12 }} />
          <Post.Skeleton style={{ marginHorizontal: 12 }} />
        </>}
        ListHeaderComponent={<>
          <ModalHeader
            title="Feed"
            type="alt"
            size="big"
            endContent={<Notification />}
            style={{
              paddingTop: 12,
              paddingHorizontal: 20,
              backgroundColor: Colors.background,
            }}
          />
          <PremiumBlock
            style={{ marginBottom: 24, marginHorizontal: 12 }}
          />
        </>}
        ListFooterComponent={<>
          {isLoading && <>
            <Post.Skeleton style={{ marginHorizontal: 12, marginBottom: 28 }} />
            <Post.Skeleton style={{ marginHorizontal: 12, marginBottom: 28 }} />
          </>}
          {!canLoadMore && <Text.Base
            color={Colors.neutral[400]}
            style={{ textAlign: 'center', maxWidth: 148, alignSelf: 'center', marginTop: 8 }}
          >
            No more posts to show in your feed.
          </Text.Base>}
        </>}
        renderItem={({ item }) => {
          if (item.type === 'outfit')
            return <OutfitPost
              key={item._id}
              id={item._id}
              style={{ marginBottom: 28 }}
            />

          return <GenerationPost
            key={item._id}
            id={item._id}
            style={{ marginBottom: 28 }}
          />
        }}
      />
    </SafeAreaView>
  );
}