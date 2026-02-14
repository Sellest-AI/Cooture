import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useQuery, useQueryCached } from "@/lib/convex/client";
import { Post } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { ViewStyle } from "react-native";
import { Colors } from "theme";

const UserPost = ({ postId, style, fullResolution }: { postId: Id<'generations'>, style?: ViewStyle, fullResolution?: boolean }) => {
  const { push } = useRouter('/post/[id]');
  const { data: post } = useQuery(api.router.generations.getOne.anon, { id: postId });
  const imageIds = post?.predictions.map((p) => p.imageId).filter(notEmpty) ?? [];
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds.length > 0 ? { imageIds } : 'skip');

  if (!post || !images) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  return (<Post
    style={{ ...style }}
    paddingHorizontal={12}
    postedAt={post.completedAt ? new Date(post.completedAt) : undefined}
    likedAccounts={[]}
    images={images?.map((img) => ({
      _id: post.predictions.find(p => p.imageId === img._id)?._id ?? post.predictions[0]?._id,
      url: fullResolution ? img.url : img.sizes.large.url,
      contentFit: img.hasAlpha ? 'contain' : 'cover',
    }))}
    user={post.user ? {
      name: post.user.name ?? 'Anonymous',
      username: post.user.name ?? 'anon',
      imageUrl: post.user.image,
      onPress: () => push(ROUTES.USER.PATH, {
        pathParams: { id: post.user!._id }
      })
    } : undefined}
    preset={post.preset?.cover ? {
      imageUrl: post.preset.cover.sizes.thumbnail.url,
      onPress: () => push(ROUTES.PHOTOSHOOT.RECAP, {
        params: { presetId: post.preset?._id, outfitId: post.outfit?._id }
      })
    } : undefined}
    outfit={post.outfit ? {
      itemUrls: post.outfit.items.map(i => i.image.sizes.thumbnail.url),
      onPress: () => push(ROUTES.OUTFIT.PATH, {
        pathParams: { id: post.outfit!._id }
      })
    } : undefined}
  />
  )
}

export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'predictions'> }>();
  const { data: post } = useQuery(api.router.generations.getFromPrediction.anon, { id });
  const { data: postsFromUser, isPending } = useQuery(api.router.feed.getFromUser.anon, post?.user?._id ? { userId: post?.user?._id } : 'skip');

  const posts = (postsFromUser ?? []).filter((p) => p._id !== post?._id);

  const items = useMemo(() => [
    { id: post?._id },
    ...posts.map((p) => ({ id: p._id })),
  ], [post, posts]);

  const renderItem = useCallback(({ item }: { item: typeof items[number] }) => {
    if (!item.id) return null;
    return <UserPost
      postId={item.id}
      style={{ marginTop: 8, marginBottom: 28 }}
      fullResolution={item.id === post?._id}
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