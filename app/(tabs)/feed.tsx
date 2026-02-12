import { ROUTES, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useQuery, useQueryCached } from "@/lib/convex/client";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Post } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView, useSafeAreaInsets } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { ViewStyle } from "react-native";
import { Colors } from "theme";

const PredictionPost = ({ id, style }: { id: Id<'predictions'>, style?: ViewStyle }) => {
  const { push } = useRouter('/feed');
  const { data: post } = useQuery(api.router.post.getOne.anon, { id });
  const predictions = post ? [post, ...post.generationPredictions.filter((p) => p.status === 'ACCEPTED')] : [];
  const imageIds = predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds.length > 0 ? { imageIds } : 'skip');

  if (!post) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  return (<Post
    style={{ ...style }}
    paddingHorizontal={12}
    postedAt={post.readyAt ? new Date(post.readyAt) : undefined}
    likedAccounts={[]}
    onPress={(id) => router.push(`/post/${id}`)}
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

const OutfitPost = ({ id, style }: { id: Id<'outfits'>, style?: ViewStyle }) => {
  const { push } = useRouter('/feed');
  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, { outfitId: id });
  const { data: user } = useQuery(api.router.users.getAccount.anon, outfit ? { userId: outfit.userId } : 'skip');

  if (!outfit) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  const cover = {
    _id: outfit._id,
    url: outfit.cover?.url ?? outfit.items[0].image.url,
    contentFit: 'contain' as const,
  }

  return <Post
    style={style}
    paddingHorizontal={12}
    postedAt={outfit._creationTime ? new Date(outfit._creationTime) : undefined}
    likedAccounts={[]}
    image={cover}
    user={user ? {
      name: user.name ?? 'Anonymous',
      username: user.name ?? 'anon',
      imageUrl: user.image,
      onPress: () => push(ROUTES.USER.PATH, {
        pathParams: { id: user!._id }
      })
    } : undefined}
    outfit={{
      itemUrls: outfit.items.map((i) => i.image.sizes.thumbnail.url),
      onPress: () => push(ROUTES.PHOTOSHOOT.NEW, {
        params: { outfitId: outfit._id }
      })
    }}
  // user={outfit.}
  />;
}

export default function Screen() {
  const { data: feed } = useQuery(api.router.post.getFeed.anon);
  const { top } = useSafeAreaInsets();

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'maximum' }} style={{ flex: 1 }}>
      <FlashList
        data={(feed ?? [])}
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
          <Text.Base
            color={Colors.neutral[400]}
            style={{ textAlign: 'center', maxWidth: 148, alignSelf: 'center', marginTop: 32 }}
          >
            No more posts to show in your feed.
          </Text.Base>
        </>}
        renderItem={({ item, index }) => {
          const items = (feed ?? []);

          if (item.type === 'outfit')
            return <OutfitPost
              key={item._id}
              id={item._id}
              style={{ marginBottom: index === items.length - 1 ? 0 : 28 }}
            />

          return <PredictionPost
            key={item._id}
            id={item._id}
            style={{ marginBottom: index === items.length - 1 ? 0 : 28 }}
          />
        }}
      />
    </SafeAreaView>
  );
}