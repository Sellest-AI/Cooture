import { Api, api, Id } from "@/lib/convex/api";
import { useMutation, usePaginatedQueryCached, useQueryCached } from "@/lib/convex/client";
import { EmptyBlock } from "@ui/block.empty";
import { Notification } from "@ui/cards";
import { Bell } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { mergeLoadMoreArrays, notEmpty } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const GenerationNotification = ({ generationId, onPress }: { generationId: Id<'generations'>; onPress?: () => void }) => {
  const { data: generation } = useQueryCached(api.router.generations.getOne.authed, { generationId: generationId });

  const presetId = generation?.presetId;
  const { data: preset } = useQueryCached(api.router.presets.getOne.anon, presetId ? { presetId } : 'skip');

  const imageIds = generation?.predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip')

  const ready = generation?.status !== 'LOADING';

  const imagesLoaded = (imageIds?.length === 0) || images;
  if (!preset || !generation || !imagesLoaded) return <Notification.Skeleton />

  return (
    <Notification
      read={generation.status === 'COMPLETED'}
      onPress={() => {
        onPress?.();
        if (generation.isVideosOnly) router.push(ROUTES.GENERATIONS.VIDEO.ID(generationId));
        else router.push(ROUTES.GENERATIONS.PHOTOSHOOT.ID(generationId));
      }}
      leftImage={preset?.cover?.sizes.thumbnail.url}
      rightImage={{ url: images?.[0]?.sizes.thumbnail.url }}
      date={generation.completedAt ?? generation._creationTime}
    >
      {(DateComponent) => <Text.Base color={Colors.neutral[50]}>
        {"Your photoshoot"}
        <Text.Base color={Colors.foreground} weight={600}> {`"${preset.name}" `}</Text.Base>
        {ready ? "is ready!" : "is being generated."}
        <DateComponent paddingLeft />
      </Text.Base>}
    </Notification>
  )
}

type GenereticNotificationProps = {
  data?: Api['router']['notifications']['getPaginated']['authed']['_returnType']['page'][number];
  id: Id<'notifications'>;
  onPress?: () => void;
  read?: boolean;
}
const GenericNotification = ({ id, onPress, read, data }: GenereticNotificationProps) => {
  const _unread = useQueryCached(api.router.notifications.getUnread.authed);
  const unread = (_unread?.data ?? []);

  const notification = unread.find((n) => n._id === id) ?? data;

  const rightImageId = notification?.generation?.coverId ?? notification?.outfit?.coverId ?? notification?.preset?.imageIds[0];
  const { data: rightImage } = useQueryCached(api.router.storage.images.getOne.anon, rightImageId ? { id: rightImageId } : 'skip');

  const TextComponent = useCallback(() => {
    if (!notification) return null;

    const aggregationCount = notification.aggregationCount ?? 1;

    if (notification.type === "new_like")
      return <>
        <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
        {aggregationCount > 1 ? `and ${aggregationCount} people liked your post.` : "liked your post."}
      </>

    if (notification.type === "new_follower")
      return <>
        <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
        started following you.
      </>

    if (notification.type === "tagged_in_generation") {
      if (notification.generation)
        return <>
          <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
          tagged you in a photoshoot <Text.Base color={Colors.foreground} weight={600}>{`"${notification.generation?.preset?.name}"`}</Text.Base>
        </>
    }

    if (notification.type === "outfit_used")
      if (notification.outfit)
        return <>
          <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
          {aggregationCount > 1 ? `and ${aggregationCount} people used your outfit` : "used your outfit"} <Text.Base color={Colors.foreground} weight={600}>{`"${notification.outfit.name}"`}</Text.Base>.
        </>

    if (notification.type === "preset_used") {
      if (notification.preset)
        return <>
          <Text.Base color={Colors.foreground} weight={600}>{notification.actor?.name} </Text.Base>
          {aggregationCount > 1 ? `and ${aggregationCount} people used your preset` : "used your preset"} <Text.Base color={Colors.foreground} weight={600}>{`"${notification.preset.name}"`}</Text.Base>.
        </>
    }

  }, [notification])

  if (!notification) return null;

  return (
    <Notification
      read={read}
      onPress={() => {
        onPress?.()
        requestAnimationFrame(() => {
          if (notification.type === "new_like") {
            if (notification.outfitId) router.push(ROUTES.OUTFIT.ID(notification.outfitId));
            if (notification.generation) router.push(ROUTES.POST.ID(notification.generation.firstPredictionId));
          }
          if (notification.type === "new_follower") {
            if (notification.actor) router.push(ROUTES.USER.ID(notification.actor._id));
          }
          if (notification.type === "tagged_in_generation") {
            if (notification.generation) router.push(ROUTES.POST.ID(notification.generation.firstPredictionId));
          }
          if (notification.type === "outfit_used") {
            if (notification.generation) router.push(ROUTES.POST.ID(notification.generation.firstPredictionId));
            else if (notification.outfitId) router.push(ROUTES.OUTFIT.ID(notification.outfitId));
          }
          if (notification.type === "preset_used") {
            if (notification.presetId) router.push(ROUTES.PRESETS.ID.toString(notification.presetId));
          }
        });
      }}
      leftImage={notification.actor?.image}
      rightImage={rightImageId ? {
        url: rightImage?.sizes.thumbnail.url,
        backgroundColor: notification.outfit?.backgroundColor
      } : undefined}
      date={notification._creationTime}
    >
      {(DateComponent) => <Text.Base color={Colors.neutral[50]}>
        <TextComponent />
        <DateComponent paddingLeft />
      </Text.Base>}
    </Notification>
  )
}

export default function Screen() {
  const { mutate: readNotifications } = useMutation(api.router.notifications.readNotifications.authed);

  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.authed, {}, { initialNumItems: 12 });
  const generations = (_generations.results ?? []);

  const _notifications = usePaginatedQueryCached(api.router.notifications.getPaginated.authed, {}, { initialNumItems: 12 });
  const notifications = (_notifications.results ?? []);

  const _unread = useQueryCached(api.router.notifications.getUnread.authed);
  const unread = (_unread?.data ?? []);

  const isEmpty = !_generations.isLoading && generations.length === 0
    && !_notifications.isLoading && notifications.length === 0
    && !_unread.isPending && unread.length === 0;

  const canLoadMore = _generations.status === "CanLoadMore"
    || _notifications.status === "CanLoadMore";

  const pendingGenerations = generations.filter((g) => g.status !== 'COMPLETED');

  const Component = isEmpty ? SafeAreaView : SafeScrollView;

  return (
    <Component
      edges={{ bottom: 'android' }}
      style={{
        padding: 12,
        paddingHorizontal: 8,
        paddingTop: Platform.OS !== 'ios' ? 12 : 0,
        flex: isEmpty ? 1 : undefined
      }}
      stickyHeaderIndices={[0]}
      onReachEnd={() => {
        if (canLoadMore) {
          _generations.loadMore(12);
          _notifications.loadMore(12);
        }
      }}
    >
      <ModalHeader
        style={{ backgroundColor: Colors.background, paddingHorizontal: 4 }}
        onBack={() => router.canGoBack() ? router.back() : router.dismissTo(ROUTES.TABS.FEED)}
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
        <GenerationNotification
          key={generation._id}
          generationId={generation._id}
          onPress={() => {
            const notification = unread.find((u) => u.generationId === generation._id);
            if (notification) readNotifications({ notificationIds: [notification._id] });
          }}
        />
      ))}
      {unread.filter((n) => n.type !== 'generation_ready').map((notification) => (
        <GenericNotification
          key={notification._id}
          id={notification._id}
          onPress={() => { readNotifications({ notificationIds: [notification._id] }) }}
          read={false}
        />
      ))}
      {pendingGenerations.length > 0 &&
        <Text.Base color={Colors.foreground} weight={600} style={{ marginBottom: 8, marginLeft: 4 }}>
          Earlier
        </Text.Base>}
      {mergeLoadMoreArrays(
        notifications.filter((g) => g.type !== 'generation_ready').map((n) => ({ ...n, objectType: 'NOTIFICATION' as const })),
        generations.filter((g) => g.status === 'COMPLETED').map((g) => ({ ...g, objectType: 'GENERATION' as const })),
        { canLoadMore: _notifications.status !== "Exhausted" }
      ).map((notification, i) => {
        if (notification.objectType === "GENERATION") {
          return <GenerationNotification
            key={notification._id}
            generationId={notification._id}
            onPress={() => {
              const notif = unread.find((u) => u.generationId === notification._id);
              if (notif) readNotifications({ notificationIds: [notif._id] });
            }}
          />
        }

        return (
          <GenericNotification
            data={notification}
            key={notification._id}
            id={notification._id}
            onPress={() => { readNotifications({ notificationIds: [notification._id] }) }}
            read={true}
          />
        )
      })}
      {(canLoadMore || _generations.isLoading || _notifications.isLoading) && <>
        <Notification.Skeleton />
        <Notification.Skeleton />
        <Notification.Skeleton />
        <Notification.Skeleton />
      </>}
    </Component>
  )
}