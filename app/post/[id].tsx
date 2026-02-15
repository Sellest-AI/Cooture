import { useRoute } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { GenerationPost } from "@/modules/feed/post.generation";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Post } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Colors } from "theme";


export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'predictions'> }>();
  const { data: post } = useQuery(api.router.generations.getFromPrediction.anon, { id });
  const { data: postsFromUser, isPending } = useQuery(api.router.feed.getFromUser.anon, post?.user?._id ? { userId: post?.user?._id } : 'skip');

  const posts = (postsFromUser ?? []).filter((p) => p._id !== post?._id);

  const items = useMemo(() => [
    { id: post?._id },
    ...posts.map((p) => ({ id: p._id })),
  ], [post, posts]);

  const renderItem = useCallback(({ item, index }: { item: typeof items[number], index: number }) => {
    if (!item.id) return null;
    if (index % 6 === 0 && index > 0) {
      return (<>
        <PremiumBlock />
        <GenerationPost
          id={item.id}
          style={{ marginTop: 28, marginBottom: 28 }}
          imageQuality={item.id === post?._id ? 'full' : 'optimized'}
          disableLongPress={true}
        />
      </>
      )
    }
    return <GenerationPost
      id={item.id}
      style={{ marginTop: 8, marginBottom: 28 }}
      imageQuality={item.id === post?._id ? 'full' : 'optimized'}
      disableLongPress={true}
    />
  }, [post]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ModalHeader
        style={{
          paddingTop: 12,
          backgroundColor: Colors.background,
          paddingHorizontal: 12
        }}
        onBack={() => router.back()}
        title="Publications"
        type="alt"
      />
      <FlashList
        data={items}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(i, index) => i?.id ?? `${index}`}
        ListEmptyComponent={<>
          <Post.Skeleton style={{ marginBottom: 28, marginHorizontal: 12 }} />
          <Post.Skeleton style={{ marginBottom: 28, marginHorizontal: 12 }} />
        </>}
        ListFooterComponent={
          <>
            {isPending && <>
              <Post.Skeleton style={{ marginBottom: 28, marginHorizontal: 12 }} />
              <Post.Skeleton style={{ marginBottom: 28, marginHorizontal: 12 }} />
            </>}
            <Text.Base color={Colors.neutral[400]} style={{
              textAlign: 'center',
              marginTop: 32,
              maxWidth: 156,
              alignSelf: 'center',
              marginBottom: 32
            }}>
              No more posts to show from this user.
            </Text.Base>
          </>
        }
      />
    </SafeAreaView>
  )
}