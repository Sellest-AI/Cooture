import { api, Id } from "@/lib/convex/api";
import { usePaginatedQueryCached, useQueryCached } from "@/lib/convex/client";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { EmptyBlock } from "@ui/block.empty";
import { Bell } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";


type Props = {
  generationId: Id<'generations'>;
  status: 'PENDING' | 'LOADING' | 'COMPLETED';
  completed: boolean;
}
const Notification = ({ generationId, completed, status }: Props) => {
  const { data: generation, isPending } = useQueryCached(api.router.generations.getOne.authed, { generationId: generationId });

  const presetId = generation?.metadata?.presetId;
  const { data: preset, isPending: presetPending } = useQueryCached(api.router.presets.getOne.anon, presetId ? { presetId } : 'skip');

  const imageIds = generation?.predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip')

  if (isPending || !generation) return <Skeleton
    style={{ height: 76, width: '100%', marginBottom: 20 }}
  />

  const Component = completed ? View : Block;

  return (
    <Pressable
      onPress={() => router.push(ROUTES.PHOTOSHOOT.GENERATIONS.ID(generationId))}
    >
      <Component
        variant="blur"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 12,
          paddingHorizontal: completed ? 8 : 12,
          marginBottom: completed ? 8 : 16,
          borderRadius: 28,
          gap: 24,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {presetPending ?
            <Skeleton style={{ width: 46, height: 46, borderRadius: 99 }} /> :
            <Badge
              style={{ width: 46, height: 46, flexShrink: 0 }}
              source={preset?.cover?.sizes.thumbnail.url}
            />
          }
          <View style={{ gap: 3, overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <Text.Base color={Colors.neutral[50]} weight={600} numberOfLines={1}>
              {completed ? 'Your images are ready' :
                status === 'PENDING' ? 'Click to approve images' :
                  'Generating your images...'}
            </Text.Base>
            {!preset ? <Skeleton style={{ height: 18, width: 120 }} /> :
              <Text.Base color={Colors.neutral[400]} weight={600} numberOfLines={1}>
                {new Date(generation._creationTime).toLocaleDateString()} - {preset.name}
              </Text.Base>}
          </View>
        </View>
        <View style={{ flexDirection: 'row', overflow: 'hidden', flexShrink: 0 }}>
          {images?.map((p, i, arr) => (
            <Image
              key={p._id}
              source={p.sizes.thumbnail.url}
              style={{
                width: 52,
                height: 56,
                borderRadius: 8,
                marginRight: i === arr.length - 1 ? 0 : -46,
                shadowColor: 'black',
                shadowOffset: { width: -2, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            />
          ))}
          {(images ?? []).length === 0 && <Skeleton
            style={{ width: 52, height: 56, borderRadius: 8 }}
          />}
        </View>
      </Component>
    </Pressable>
  )
}

const NotificationSkeleton = () => {
  return (
    <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Skeleton style={{ width: 46, height: 46, borderRadius: 99 }} />
        <View style={{ marginLeft: 12, justifyContent: 'center' }}>
          <Skeleton style={{ width: 80, height: 14 }} />
          <Skeleton style={{ width: 128, height: 14, marginTop: 4 }} />
        </View>
      </View>
      <Skeleton style={{ width: 56, height: 56 }} />
    </View>
  )
}

export default function Screen() {
  const data = usePaginatedQueryCached(api.router.generations.getPaginated.authed, {}, { initialNumItems: 12 });
  const generations = (data.results ?? []);

  const isEmpty = !data.isLoading && generations.length === 0;

  const Component = isEmpty ? View : SafeScrollView;

  const pendingGenerations = generations.filter((g) => g.status !== 'COMPLETED');

  return (
    <Component
      style={{
        padding: 12,
        paddingHorizontal: 8,
        paddingTop: 0,
        flex: isEmpty ? 1 : undefined
      }}
      stickyHeaderIndices={[0]}
      onReachEnd={() => { if (data.status === "CanLoadMore") data.loadMore(12); }}
    >
      <ModalHeader
        style={{ backgroundColor: Colors.background, paddingTop: 12, paddingHorizontal: 4 }}
        onBack={() => router.back()}
        title="Notifications"
        type="alt"
      />
      {isEmpty && <EmptyBlock
        style={{ marginTop: -52 }}
        icon={Bell}
        title="Notifications"
        description="You have no notifications at the moment. When you generate new images, you'll see them here."
        cta={{
          onPress: () => router.replace(ROUTES.PHOTOSHOOT.NEW),
          label: "New Photoshoot"
        }}
      />}
      {pendingGenerations.map((generation) => (
        <Notification
          key={generation._id}
          generationId={generation._id}
          status={generation.status}
          completed={generation.status === 'COMPLETED'}
        />
      ))}
      {pendingGenerations.length > 0 &&
        <Text.Base color={Colors.foreground} weight={600} style={{ marginBottom: 8, marginLeft: 4 }}>
          Earlier
        </Text.Base>}
      {generations.filter((g) => g.status === 'COMPLETED').map((generation) => (
        <Notification
          key={generation._id}
          generationId={generation._id}
          status={generation.status}
          completed={generation.status === 'COMPLETED'}
        />
      ))}
      {(data.status === "CanLoadMore" || data.isLoading) && <>
        <NotificationSkeleton />
        <NotificationSkeleton />
        <NotificationSkeleton />
        <NotificationSkeleton />
      </>}
    </Component>
  )
}