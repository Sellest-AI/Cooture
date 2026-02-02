import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Post } from "@ui/cards";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

const FeedPost = ({ id, style }: { id: Id<'predictions'>, style?: ViewStyle }) => {
  const { data: post } = useQuery(api.router.post.getOne.anon, { id });
  if (!post) return <Post.Skeleton style={style} />;

  return (
    <Post
      style={style}
      postedAt={post.readyAt ? new Date(post.readyAt) : undefined}
      likedAccounts={[]}
      postUrl={`/post/${id}`}
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
  const { data: feed } = useQuery(api.router.post.getFeed.anon);

  return (
    <SafeScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: TOTAL_TABS_SPACE
      }}
    // stickyHeaderIndices={[0]}
    >
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
      <View style={{ paddingHorizontal: 8, marginTop: 8 }}>
        <PremiumBlock
          style={{ marginBottom: 20 }}
        />
        {!feed && <Post.Skeleton />}
        {(feed ?? []).map((post, i, arr) => <FeedPost key={post} id={post} style={{ marginBottom: i === arr.length - 1 ? 0 : 28 }} />)}
      </View>
    </SafeScrollView>
  );
}