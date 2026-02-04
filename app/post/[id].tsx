import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useQuery, useQueryCached } from "@/lib/convex/client";
import { Post } from "@ui/cards";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { ViewStyle } from "react-native";
import { Colors } from "theme";

const UserPost = ({ postId, style }: { postId: Id<'predictions'>, style?: ViewStyle }) => {
  const { push } = useRouter('/post/[id]');
  const { data: post } = useQuery(api.router.post.getOne.anon, { id: postId });
  const predictions = post ? [post, ...post.generationPredictions.filter((p) => p.status === 'ACCEPTED')] : [];
  const imageIds = predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds.length > 0 ? { imageIds } : 'skip');

  if (!post) return <Post.Skeleton style={{ ...style }} />;

  return (<Post
    style={{ ...style }}
    paddingHorizontal={12}
    postedAt={post.readyAt ? new Date(post.readyAt) : undefined}
    likedAccounts={[]}
    images={images?.map((img) => ({
      _id: predictions.find(p => p.imageId === img._id)!._id,
      url: img.url,
      contentFit: img.hasAlpha ? 'contain' : 'cover',
    }))}
    image={post.image ? {
      _id: post._id,
      url: post.image.url,
      contentFit: post.image.hasAlpha ? 'contain' : 'cover',
    } : undefined}
    user={post.user ? {
      name: post.user.name ?? 'Anonymous',
      username: post.user.name ?? 'anon',
      imageUrl: post.user.image
    } : undefined}
    preset={post.preset?.cover ? {
      imageUrl: post.preset.cover.sizes.thumbnail.url,
      onPress: () => push(ROUTES.PHOTOSHOOT.RECAP, {
        params: { presetId: post.preset?._id, outfitId: post.outfit?._id }
      })
    } : undefined}
    outfit={post.outfit ? {
      itemUrls: post.outfit.items.map(i => i.image.url),
      onPress: () => push(ROUTES.PHOTOSHOOT.RECAP, {
        params: { presetId: post.preset?._id, outfitId: post.outfit?._id }
      })
    } : undefined}
  />
  )
}

export function Screen() {
  const { searchParams: { id } } = useRoute<{ id: Id<'predictions'> }>('/post/[id]');

  const { data: post } = useQuery(api.router.post.getOne.anon, { id });
  const { data: postsFromUser, isPending } = useQuery(api.router.post.getFromUser.anon, post?.user?._id ? { userId: post?.user?._id } : 'skip');

  return (
    <SafeScrollView
      style={{ paddingTop: 0 }}
      stickyHeaderIndices={[0]}
    >
      <ModalHeader
        style={{ backgroundColor: Colors.background, paddingTop: 12, paddingHorizontal: 12 }}
        onBack={() => router.back()}
        title="Publications"
        type="alt"
      />
      <UserPost postId={id} style={{ marginTop: 8, marginBottom: 28 }} />
      {isPending && <>
        <Post.Skeleton style={{ marginBottom: 28 }} />
        <Post.Skeleton style={{ marginBottom: 28 }} />
      </>}
      {postsFromUser?.filter((p) => p.generationId !== post?.generationId)
        .filter((p, _, arr) => arr.findLast(x => x.generationId === p.generationId)?._id === p._id)
        .map((p, i, arr) => (
          <UserPost
            key={p._id}
            postId={p._id}
            style={{ marginBottom: i < arr.length - 1 ? 28 : 0 }}
          />
        ))}
      <Text.Base color={Colors.neutral[400]} style={{
        textAlign: 'center',
        marginTop: 32,
        maxWidth: 156,
        alignSelf: 'center',
        marginBottom: 32
      }}>
        No more posts to show from this user.
      </Text.Base>
    </SafeScrollView>
  )
}