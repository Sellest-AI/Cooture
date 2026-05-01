import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { usePaginatedQuery, useQuery, useQueryCached } from "@/lib/convex/client";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { downloadVideo } from "@/lib/video/downloadVideo.native";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { Post } from "@ui/cards/post";
import { FlashList } from "@ui/flat-list";
import { ArrowUpRight, Credits } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { View } from "react-native";
import { Colors } from "theme";


const Generation = ({ id }: { id: Id<'generations'> }) => {
  const { push } = useRouter();

  const { data: post } = useQuery(api.router.generations.getOne.admin, { generationId: id });

  const imageIds = post?.predictions.map((p) => p.imageId).filter(notEmpty) ?? [];
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds.length > 0 ? { imageIds } : 'skip');

  const videoIds = post?.predictions.map((p) => p.videoId).filter(notEmpty) ?? [];
  const { data: videos } = useQueryCached(api.router.storage.videos.getMany.anon, videoIds.length > 0 ? { videoIds } : 'skip');

  if (!post) return <Post.Skeleton style={{ paddingHorizontal: 12 }} />

  return (
    <View style={{ marginBottom: 28 }}>
      <View style={{
        flexDirection: 'row', justifyContent: 'flex-start', gap: 20,
        alignItems: 'center', paddingHorizontal: 12, marginBottom: 16
      }}>
        {post.predictions.map((prediction) => {
          const image = images?.find((i) => i._id === prediction.imageId);
          if (!image) return null;
          return (
            <View key={prediction._id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image
                source={image.url}
                style={{ width: 24, height: 24, borderRadius: 99 }}
              />
              <Text.Sm color={Colors.neutral[400]}>
                {prediction.status.slice(0, 1).toUpperCase() + prediction.status.slice(1).toLowerCase()}
              </Text.Sm>
            </View>
          )
        })}
      </View>
      <Post
        paddingHorizontal={12}
        images={images?.map((img) => ({
          _id: post.predictions.find(p => p.imageId === img._id)?._id ?? post.predictions[0]?._id,
          url: img.url,
          contentFit: img.hasAlpha ? 'contain' : 'cover',
        }))}
        videos={videos?.map((video) => ({
          _id: post.predictions.find(p => p.videoId === video._id)?._id ?? post.predictions[0]?._id,
          url: video.url,
        }))}
        preset={post.preset?.cover ? {
          imageUrl: post.preset.cover.sizes.thumbnail.url,
          onPress: () => push(ROUTES.PRESETS.ID.PATH, {
            pathParams: { id: post.preset!._id },
          }),
        } : undefined}
        outfit={post.outfit ? {
          itemUrls: post.outfit.items.map(i => i.image.sizes.thumbnail.url),
          onPress: () => push(ROUTES.OUTFIT.PATH, { pathParams: { id: post.outfit!._id } })
        } : undefined}
        onDownload={async (url) => {
          await downloadImageCrossPlatform(url, { applyWatermark: true })
            .catch(async () => downloadVideo(url).catch(() => null))
        }}
      />
    </View>
  )

}

export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'users'> }>();

  const { data: user } = useQuery(api.router.users.getAccount.admin, { userId: id });
  const { results: generations, status } = usePaginatedQuery(api.router.generations.getPaginated.admin, { userId: id }, { initialNumItems: 512 });

  if (!user) return null;

  return (
    <FlashList
      bounces={false}
      ListHeaderComponent={<View style={{ marginBottom: 24 }}>
        <Image
          source={user.image}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
          }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', Colors.background]}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />
        <SafeAreaView edges={{ bottom: 'off' }}>
          <ModalHeader
            style={{ width: '100%', paddingHorizontal: 12, paddingBottom: 172 }}
            onBack={() => router.back()}
            title="Profile"
            type="alt"
            size="big"
            endContent={
              <Pressable onPress={() => router.push(ROUTES.USER.ID(user._id))}>
                <Block
                  variant="blur"
                  style={{
                    borderRadius: 99,
                    padding: 12,
                  }}
                >
                  <ArrowUpRight size={22} color={Colors.foreground} />
                </Block>
              </Pressable>
            }
          />
        </SafeAreaView>
        <View style={{ paddingHorizontal: 20 }}>
          {user.username && <Text.Lg color={Colors.neutral[200]} weight={500} style={{ marginBottom: 2 }}>
            @{user.username}
          </Text.Lg>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text.H3 color={Colors.foreground} numberOfLines={1}>{user.name}</Text.H3>
              {user.isPremium && <Credits size={18} />}
            </View>
            <Text.Base color={Colors.neutral[400]} weight={600} >
              Since {new Date(user._creationTime).getFullYear()}
            </Text.Base>
          </View>
        </View>
      </View>}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE }}
      data={generations}
      renderItem={({ item }) => <Generation id={item._id} />}
      keyExtractor={(item) => item._id.toString()}
      ListEmptyComponent={status === 'LoadingFirstPage' ?
        <View>
          <Post.Skeleton style={{ paddingHorizontal: 12, marginBottom: 24 }} />
          <Post.Skeleton style={{ paddingHorizontal: 12, marginBottom: 24 }} />
        </View>
        : undefined
      }
    />
  )
}