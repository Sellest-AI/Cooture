import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { usePaginatedQuery, useQuery, useQueryCached } from "@/lib/convex/client";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { downloadVideo } from "@/lib/video/downloadVideo.native";
import { TransactionsModal } from "@/modules/admin/transactions.modal";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Post } from "@ui/cards/post";
import { FlashList } from "@ui/flat-list";
import { Col, Grid } from "@ui/grid";
import { ArrowUpRight, Credits } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useState } from "react";
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
  const [modalOpen, setModalOpen] = useState(false);
  const { id } = useRoute.Params<{ id: Id<'users'> }>();

  const { data: user } = useQuery(api.router.users.getAccount.admin, { userId: id });
  const { data: appearance } = useQuery(api.router.users.getAppearance.admin, { userId: id });
  const { results: generations, status } = usePaginatedQuery(api.router.generations.getPaginated.admin, { userId: id }, { initialNumItems: 512 });

  if (!user) return null;

  return (
    <>
      <FlashList
        bounces={false}
        ListHeaderComponent={<View style={{ marginBottom: 24 }}>
          <Image
            blurRadius={1}
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
          <View style={{ paddingHorizontal: 12 }}>
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
          {appearance && <Grid
            style={{
              marginTop: 12,
              height: 148,
              paddingHorizontal: 8,
              width: '100%',
              gap: 12
            }}>
            {appearance?.frontImage && (
              <Col>
                <Image
                  source={appearance.frontImage.sizes.medium.url}
                  style={{
                    aspectRatio: appearance.frontImage.aspectRatio.actual,
                    borderRadius: 12,
                  }}
                />
              </Col>)}
            {appearance?.sideImage && (
              <Col>
                <Image
                  source={appearance.sideImage.sizes.medium.url}
                  style={{
                    aspectRatio: appearance.sideImage.aspectRatio.actual,
                    borderRadius: 12,
                  }}
                />
              </Col>)}
            {appearance?.smileImage && (
              <Col>
                <Image
                  source={appearance.smileImage.sizes.medium.url}
                  style={{
                    aspectRatio: appearance.smileImage.aspectRatio.actual,
                    borderRadius: 12,
                  }}
                />
              </Col>)}
          </Grid>}
          {appearance && <View style={{
            marginTop: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 24,
            paddingHorizontal: 12
          }}>
            <Text.Base color={Colors.neutral[400]}>🧠 {appearance.gender}</Text.Base>
            <Text.Base color={Colors.neutral[400]}>📏 {appearance.heightCm?.toString()} cm</Text.Base>
            <Text.Base color={Colors.neutral[400]}>👕 {appearance.size}</Text.Base>
          </View>}
          <View style={{ marginTop: 28, flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            <Button
              align="center"
              onPress={() => setModalOpen(true)}
              variant="primary"
              size="sm"
            >
              Open history
            </Button>
            <Button
              align="center"
              onPress={() => router.push(ROUTES.USER.ID(user._id))}
              variant="blur"
              size="sm"
            >
              Open profile
            </Button>
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
      <TransactionsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={id}
      />
    </>
  )
}