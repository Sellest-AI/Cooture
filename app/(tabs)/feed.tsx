import { useFeed } from "@/modules/feed/_hooks";
import { GenerationPost } from "@/modules/feed/post.generation";
import { OutfitPost } from "@/modules/feed/post.outfit";
import { CreditsButton } from "@/modules/premium/credits.button";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { WaitlistBlock } from "@/modules/waitlist/waitlist-block";
import { useScrollToTop } from "@react-navigation/native";
import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { Post } from "@ui/cards";
import { FlashList, FlashListRef } from "@ui/flat-list";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView, useSafeAreaInsets } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { useRef } from "react";
import { Platform, RefreshControl, View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { feed, canLoadMore, updateSeed, isLoading, loadMore } = useFeed({ initialNumItems: 8 });

  const data = ['waitlist', ...feed].filter(notEmpty);

  const listRef = useRef<FlashListRef<typeof data[number]>>(null);

  const { top } = useSafeAreaInsets();
  useScrollToTop(listRef);

  return (
    <BlurTargetView blurKey={BlurKeys.FEED}>
      <SafeAreaView edges={{ top: 'off', bottom: 'android' }} style={{ flex: 1 }}>
        <FlashList
          ref={listRef}
          refreshing={isLoading}
          refreshControl={<RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              updateSeed();
              setTimeout(() => listRef.current?.scrollToOffset({ offset: 0 }), 400);
            }}
            tintColor={Colors.primary[500]}
            progressViewOffset={top}
          />}
          // onRefresh={() => { updateSeed(); listRef.current?.scrollToOffset({ offset: 0 }) }}
          onEndReached={() => loadMore(8)}
          data={data}
          keyExtractor={(i) => typeof i === 'string' ? i : i?._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: TOTAL_TABS_SPACE,
            paddingTop: Platform.OS !== 'ios' ? top + 8 : top,
          }}
          ListEmptyComponent={<>
            <Post.Skeleton style={{ marginHorizontal: 12 }} />
            <Post.Skeleton style={{ marginHorizontal: 12 }} />
          </>}
          ListHeaderComponent={<>
            <ModalHeader
              title="Home"
              type="alt"
              size="big"
              endContent={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CreditsButton />
                <Notification />
              </View>}
              style={{
                paddingLeft: 16,
                paddingRight: 12,
                backgroundColor: Colors.background,
              }}
            />
            {/* <View style={{
              paddingHorizontal: 12,
              marginBottom: 28,
            }}>
              <RandomizerHeader style={{ paddingRight: 8, marginBottom: 12 }} />
              <OutfitRandomizerPreview />
            </View> */}
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
            if (typeof item === 'string')
              return <WaitlistBlock
                style={{ marginBottom: 28, marginHorizontal: 12 }}
              />

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
    </BlurTargetView>
  );
}