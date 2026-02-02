import { useRoute } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { Post } from "@ui/cards";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { router } from "expo-router";
import { ViewStyle } from "react-native";
import { Colors } from "theme";

const UserPost = ({ postId, style }: { postId: Id<'predictions'>, style?: ViewStyle }) => {
  const { data: post } = useQuery(api.router.post.getOne.anon, { id: postId });

  if (!post) return <Post.Skeleton style={{ ...style }} />;

  return (<Post
    style={{ ...style }}
    postedAt={post.readyAt ? new Date(post.readyAt) : undefined}
    likedAccounts={[]}
    postUrl={`/post/${postId}`}
    image={post.image ? {
      url: post.image.url,
      contentFit: post.image.hasAlpha ? 'contain' : 'cover',
    } : undefined}
    user={post.user ? {
      name: post.user.name ?? 'Anonymous',
      username: post.user.name ?? 'anon',
      imageUrl: post.user.image
    } : undefined}
    preset={post.preset?.cover ? {
      imageUrl: post.preset.cover.sizes.thumbnail.url
    } : undefined}
    outfit={post.outfit ? {
      itemUrls: post.outfit.items.map(i => i.image.url),
    } : undefined}
  />
  )
}
export default function Screen() {
  const { searchParams: { id } } = useRoute<{ id: Id<'predictions'> }>('/post/[id]');

  const { data: post } = useQuery(api.router.post.getOne.anon, { id });
  const { data: postsFromUser, isPending } = useQuery(api.router.post.getFromUser.anon, post?.user?._id ? { userId: post?.user?._id } : 'skip');

  return (
    <SafeScrollView
      style={{ padding: 12, paddingTop: 0 }}
      stickyHeaderIndices={[0]}
    >
      <ModalHeader
        style={{ backgroundColor: Colors.background, paddingTop: 12 }}
        onBack={() => router.back()}
        title="Publications"
        type="alt"
      />
      <UserPost postId={id} style={{ marginTop: 8, marginBottom: 28 }} />
      {isPending && <>
        <Post.Skeleton style={{ marginBottom: 28 }} />
        <Post.Skeleton style={{ marginBottom: 28 }} />
      </>}
      {postsFromUser?.filter((p) => p._id !== id).map((p, i, arr) => (
        <UserPost
          key={p._id}
          postId={p._id}
          style={{ marginBottom: i < arr.length - 1 ? 28 : 0 }}
        />
      ))}
    </SafeScrollView>
  )
}